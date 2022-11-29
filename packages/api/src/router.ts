import { type Prisma } from "@prisma/client";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import superjson from "superjson";
import { z } from "zod";

const workoutSchema = z.object({
  date: z.date(),
  description: z.string(),
  value: z.string(),
});

export interface Env {
  DB: D1Database;
}

interface Database {
  [Prisma.ModelName.Workout]: {
    id: string;
    updatedAt: string;
    description: string;
    value: string;
    date: string;
    user: string;
  };
}

function createContext(req: Request, DB: D1Database) {
  const user = req.headers.get("authorization")?.trim() ?? "";
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: DB }),
  });
  return { req, user, db };
}

export function createContextFactory(DB: D1Database) {
  return ({ req }: FetchCreateContextFnOptions) => {
    return createContext(req, DB);
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create({ transformer: superjson });

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
          })
          .merge(workoutSchema)
      )
    )
    .query(async ({ ctx }) => {
      const result = await ctx.db
        .selectFrom("Workout")
        .selectAll()
        .where("Workout.user", "=", ctx.user)
        .orderBy("Workout.date", "desc")
        .execute();
      return [...result.values()].map(({ date, ...props }) => ({
        ...props,
        date: new Date(date),
      }));
    }),
  createWorkout: t.procedure
    .input(workoutSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insertInto("Workout")
        .values({
          id: crypto.randomUUID(),
          updatedAt: new Date().toISOString(),
          value: input.value,
          description: input.description,
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
