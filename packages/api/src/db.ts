import type { D1Database } from "@cloudflare/workers-types/experimental";
import { Kysely, sql } from "kysely";
import { D1Dialect } from "kysely-d1";

import { DB } from "../db";

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
      "w.isTime",
      (eb) =>
        eb
          .selectFrom("Workout as tw")
          .select((eb) => eb.fn.max("tw.numberValue").as("maxScore"))
          .where(
            sql`lower(tw.description)`,
            "=",
            sql`lower(${eb.ref("w.description")})`
          )
          .where("tw.userId", "=", userId)
          .as("maxScore"),
      (eb) =>
        eb
          .selectFrom("Workout as tw")
          .select((eb) => eb.fn.min("tw.numberValue").as("minScore"))
          .where(
            sql`lower(tw.description)`,
            "=",
            sql`lower(${eb.ref("w.description")})`
          )
          .where("tw.userId", "=", userId)
          .as("minScore"),
    ])
    .where("w.userId", "=", userId)
    .orderBy("w.date", "desc");
}

export function hydrateWorkout(workout: DBWorkout) {
  return {
    ...workout,
    maxScore: workout.maxScore,
    minScore: workout.minScore,
    isTime: [1, "1", "true"].includes(workout.isTime),
    date: new Date(workout.date),
  };
}

export function getQueryBuilder(d1: D1Database) {
  return new Kysely<DB>({
    dialect: new D1Dialect({ database: d1 }),
  });
}
