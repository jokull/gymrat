import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { sealData, unsealData } from "iron-session/edge";
import superjson from "superjson";
import { z } from "zod";

import { type User } from "../db";
import { generateApiKey } from "./apiKeys";
import { getQueryBuilder, hydrateWorkout, queryWorkouts } from "./db";
import { hashPassword, verifyPassword } from "./passwords";
import { type Env } from "./types";
import { normalizeEmail } from "./utils/emails";
import { getNumberValue } from "./utils/score";

const workoutFormSchema = z.object({
  date: z.date(),
  description: z.string(),
  value: z.string(),
});

function createContext(req: Request, { DB, ...env }: Env, user: User | null) {
  const db = getQueryBuilder(DB);
  return { req, user, db, env, _session: "" };
}

export function createContextFactory(env: Env, user: User | null) {
  return ({ req }: FetchCreateContextFnOptions) => {
    return createContext(req, env, user);
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

async function getUserFromEmail(db: Context["db"], email: string) {
  return await db
    .selectFrom("User")
    .selectAll()
    .where("User.email", "=", normalizeEmail(email))
    .executeTakeFirst();
}

const loginProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    const result = await next({ ctx });
    const resultCtx = "ctx" in result ? (result.ctx as Context) : undefined;
    if (resultCtx?.user) {
      // resultCtx is not the ctx passed to `responseMeta` where we need
      // `_session` to set the cookie. We would do it all in `responseMeta` but
      // it is not and awaitable unfortunately.
      ctx._session = await sealData(
        { email: resultCtx.user.displayEmail, id: resultCtx.user.id },
        { password: resultCtx.env.SECRET_KEY, ttl: 60 * 60 * 24 * 365 } // 1 year
      );
    }
    return result;
  })
);

const authProcedure = t.procedure.use(
  t.middleware(async ({ ctx: { user, ...ctx }, next }) => {
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { user, ...ctx } });
  })
);

interface VerifyEmailToken {
  email: string;
}

export const appRouter = t.router({
  login: loginProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db
        .selectFrom("User")
        .selectAll()
        .where("User.email", "=", normalizeEmail(input.email))
        .executeTakeFirst();
      if (user && verifyPassword(input.password, user.hashedPassword)) {
        ctx.user = user;
        return { email: normalizeEmail(input.email) };
      }
      return { error: "No user has this email and password combination" };
    }),
  unsealToken: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
    return await unsealData<VerifyEmailToken | Record<string, never>>(input, {
      password: ctx.env.SECRET_KEY,
      ttl: 60 * 60, // One hour
    });
  }),
  sendVerifyEmail: t.procedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const token = await sealData(
        { email: normalizeEmail(input.email) },
        { password: ctx.env.SECRET_KEY, ttl: 15 * 60 }
      );
      console.debug(`https://${ctx.env.HOST}/auth/verify?token=${token}`);
      const contentValue = `https://${ctx.env.HOST}/auth/verify?token=${token}`;
      const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: input.email }],
            },
          ],
          from: {
            email: "no-reply@gymrat.is",
            name: "Gymrat",
          },
          subject: "Verify email",
          content: [
            {
              type: "text/plain",
              value: contentValue,
            },
          ],
        }),
      });
      return { success: response.status === 200 };
    }),
  setPassword: loginProcedure
    .input(z.object({ password: z.string().min(8), token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const unsealed = await unsealData<
        VerifyEmailToken | Record<string, never>
      >(input.token, { password: ctx.env.SECRET_KEY, ttl: 60 * 60 });

      if (!("email" in unsealed)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { email } = unsealed;

      let user = await getUserFromEmail(ctx.db, email);

      if (user) {
        await ctx.db
          .updateTable("User")
          .where("User.email", "=", normalizeEmail(email))
          .set({ hashedPassword: hashPassword(input.password) })
          .execute();
      } else {
        await ctx.db
          .insertInto("User")
          .values({
            id: generateApiKey(),
            apiKey: generateApiKey(),
            displayEmail: email,
            email: normalizeEmail(email),
            hashedPassword: hashPassword(input.password),
          })
          .executeTakeFirst();
        user = await getUserFromEmail(ctx.db, email);
      }
      if (user) {
        // Lets the `responseMeta` helper add the set-cookie header
        ctx.user = user;
      }
      return { email: normalizeEmail(email) };
    }),
  user: authProcedure.query(({ ctx }) => {
    return { ...ctx.user };
  }),
  workouts: authProcedure
    .output(
      z.array(
        z
          .object({
            id: z.string().uuid(),
            maxScore: z.number(),
            minScore: z.number(),
            isTime: z.boolean(),
            numberValue: z.number(),
          })
          .merge(workoutFormSchema)
      )
    )
    .query(async ({ ctx }) => {
      const result = await queryWorkouts(ctx.db, ctx.user.id).execute();
      return Array.from(result.values()).map(hydrateWorkout);
    }),
  updateWorkout: authProcedure
    .input(
      z.object({ id: z.string().uuid(), fields: workoutFormSchema.partial() })
    )
    .mutation(async ({ ctx, input }) => {
      const updateStatement = ctx.db.updateTable("Workout");

      let values: Parameters<typeof updateStatement.set>[0] = {};

      if (input.fields.value) {
        const numberValue = getNumberValue(input.fields.value);
        values = {
          value: input.fields.value.trim(),
          numberValue: numberValue.value,
          isTime: numberValue.isTime ? "true" : "false",
        };
      }

      if (input.fields.date) {
        values = { ...values, date: input.fields.date.toISOString() };
      }

      if (input.fields.description) {
        values = {
          ...values,
          description: input.fields.description
            .split(" ")
            .filter(Boolean)
            .join(" "),
        };
      }

      const result = await updateStatement
        .set(values)
        .where("Workout.id", "=", input.id)
        .returningAll()
        .executeTakeFirst();
      return result;
    }),
  createWorkout: authProcedure
    .input(workoutFormSchema)
    .mutation(async ({ ctx, input }) => {
      const numberValue = getNumberValue(input.value);
      const insert = await ctx.db
        .insertInto("Workout")
        .values({
          id: crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
          value: input.value,
          numberValue: numberValue.value,
          isTime: numberValue.isTime ? "true" : "false",
          description: input.description.split(" ").filter(Boolean).join(" "),
          date: input.date.toISOString(),
          userId: ctx.user.id,
        })
        .returning("id as id")
        .executeTakeFirst();
      const workout = await queryWorkouts(ctx.db, ctx.user.id)
        .where("id", "=", insert?.id ?? "")
        .executeTakeFirstOrThrow();
      return hydrateWorkout(workout);
    }),
  deleteWorkout: authProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .deleteFrom("Workout")
        .where("Workout.id", "=", input)
        .execute();
    }),
});

export type AppRouter = typeof appRouter;
