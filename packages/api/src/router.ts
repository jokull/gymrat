import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Kysely, sql } from "kysely";
import { DB } from "kysely-codegen";
import { D1Dialect } from "kysely-d1";
import superjson from "superjson";
import { z } from "zod";
import { getNumberValue } from "./utils";

const workoutFormSchema = z.object({
  date: z.date(),
  description: z.string(),
  value: z.string(),
});

export interface Env {
  DB: D1Database;
}

function createContext(req: Request, d1: D1Database) {
  const user =
    req.headers.get("authorization")?.trim() ??
    new URL(req.url).searchParams.get("user")?.trim() ??
    null;
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const db = new Kysely<DB>({
    dialect: new D1Dialect({ database: d1 }),
  });
  return { req, user, db };
}

export function createContextFactory(DB: D1Database) {
  return ({ req }: FetchCreateContextFnOptions) => {
    return createContext(req, DB);
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  isDev: true,
});

export const appRouter = t.router({
  user: t.procedure.query(({ ctx }) => {
    return ctx.user;
  }),
  workouts: t.procedure
    .output(
      z.array(
        z
          .object({
            id: z.string().uuid(),
            topScore: z.number(),
            numberValue: z.number(),
          })
          .merge(workoutFormSchema)
      )
    )
    .query(async ({ ctx }) => {
      const result = await ctx.db
        .selectFrom("Workout as w")
        .select([
          "w.date",
          "w.description",
          "w.id",
          "w.numberValue",
          "w.value",
          (eb) =>
            eb
              .selectFrom("Workout as tw")
              .select((eb) => eb.fn.max("tw.numberValue").as("topScore"))
              .where(
                sql`lower(tw.description)`,
                "=",
                sql`lower(${eb.ref("w.description")})`
              )
              .where("tw.user", "=", ctx.user)
              .as("topScore"),
        ])
        .where("w.user", "=", ctx.user)
        .orderBy("w.date", "desc")
        .execute();
      const dbWorkouts = [...result.values()];
      return dbWorkouts.map(({ date, ...props }) => ({
        ...props,
        topScore: props.topScore ?? 0,
        date: new Date(date),
      }));
    }),
  updateWorkout: t.procedure
    .input(
      z.object({ id: z.string().uuid(), fields: workoutFormSchema.partial() })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .updateTable("Workout")
        .set({
          value: input.fields.value?.trim(),
          description: input.fields.description
            ?.split(" ")
            .filter(Boolean)
            .join(" "),
          numberValue: input.fields.value
            ? getNumberValue(input.fields.value)
            : undefined,
          date: input.fields.date ? input.fields.date.toISOString() : undefined,
        })
        .where("Workout.id", "=", input.id)
        .executeTakeFirst();
      return result;
    }),
  createWorkout: t.procedure
    .input(workoutFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insertInto("Workout")
        .values({
          id: crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
          value: input.value,
          numberValue: getNumberValue(input.value),
          description: input.description?.split(" ").filter(Boolean).join(" "),
          date: input.date.toISOString(),
          user: ctx.user,
        })
        .executeTakeFirst();
      return result;
    }),
  deleteWorkout: t.procedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .deleteFrom("Workout")
        .where("Workout.id", "=", input)
        .execute();
    }),
});

export type AppRouter = typeof appRouter;
