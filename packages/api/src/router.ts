import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { User } from "kysely-codegen";
import superjson from "superjson";
import { z } from "zod";
import { ClerkJwtPayload } from ".";
import { getQueryBuilder, hydrateWorkout, queryWorkouts } from "./db";
import { getNumberValue } from "./utils";

const workoutFormSchema = z.object({
  date: z.date(),
  description: z.string(),
  value: z.string(),
});

function createContext(
  req: Request,
  d1: D1Database,
  user: User | null,
  clerkAuth: ClerkJwtPayload | null
) {
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const db = getQueryBuilder(d1);
  return { req, user, db, clerkAuth };
}

export function createContextFactory(
  DB: D1Database,
  user: User | null,
  clerkAuth: ClerkJwtPayload | null
) {
  return ({ req }: FetchCreateContextFnOptions) => {
    return createContext(req, DB, user, clerkAuth);
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const appRouter = t.router({
  user: t.procedure.query(({ ctx }) => {
    return { ...ctx.user, clerk: ctx.clerkAuth };
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
      const result = await queryWorkouts(ctx.db, ctx.user.id).execute();
      return Array.from(result.values()).map(hydrateWorkout);
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
      const insert = await ctx.db
        .insertInto("Workout")
        .values({
          id: crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
          value: input.value,
          numberValue: getNumberValue(input.value),
          description: input.description?.split(" ").filter(Boolean).join(" "),
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
