import { Kysely, sql } from "kysely";
import { DB } from "kysely-codegen";
import { D1Dialect } from "kysely-d1";

export interface Env {
  DB: D1Database;
}

export type DBWorkout = Awaited<
  ReturnType<ReturnType<typeof queryWorkouts>["executeTakeFirstOrThrow"]>
>;
export type Workout = ReturnType<typeof hydrateWorkout>;

export function queryWorkouts(
  db: ReturnType<typeof getQueryBuilder>,
  userId: string
) {
  return db
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
          .where("tw.userId", "=", userId)
          .as("topScore"),
    ])
    .where("w.userId", "=", userId)
    .orderBy("w.date", "desc");
}

export function hydrateWorkout(workout: DBWorkout) {
  return {
    ...workout,
    topScore: workout.topScore ?? 0,
    date: new Date(workout.date),
  };
}

export function getQueryBuilder(d1: D1Database) {
  return new Kysely<DB>({
    dialect: new D1Dialect({ database: d1 }),
  });
}
