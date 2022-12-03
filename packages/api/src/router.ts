import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { sql } from "kysely";
import { User } from "kysely-codegen";
import superjson from "superjson";
import { z } from "zod";
import { getQueryBuilder } from "./db";
import { getNumberValue } from "./utils";

const workoutFormSchema = z.object({
  date: z.date(),
  description: z.string(),
  value: z.string(),
});

function createContext(req: Request, d1: D1Database, user: User | null) {
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const db = getQueryBuilder(d1);
  return { req, user, db };
}

export function createContextFactory(DB: D1Database, user: User | null) {
  return ({ req }: FetchCreateContextFnOptions) => {
    return createContext(req, DB, user);
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
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
              .where("tw.userId", "=", ctx.user.id)
              .as("topScore"),
        ])
        .where("w.userId", "=", ctx.user.id)
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
          userId: ctx.user.id,
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
