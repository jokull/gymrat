import { desc, eq, sql } from "drizzle-orm";

import { Database } from "~/db/client";
import { User, workout } from "~/schema";

export async function getWorkouts({
  dbUser,
  db,
}: {
  dbUser: User;
  db: Database;
}) {
  const minSq = db
    .select({
      minScore: sql<number>`min(${workout.numberValue})`.as("minScore"),
      description: sql`lower(${workout.description})`.as("minDescription"),
    })
    .from(workout)
    .where(eq(workout.userId, dbUser.id))
    .groupBy(sql`lower(${workout.description})`)
    .as("minScore");

  const maxSq = db
    .select({
      maxScore: sql<number>`max(${workout.numberValue})`.as("maxScore"),
      description: sql`lower(${workout.description})`.as("maxDescription"),
    })
    .from(workout)
    .where(eq(workout.userId, dbUser.id))
    .groupBy(sql`lower(${workout.description})`)
    .as("maxScore");

  const workouts = db
    .select({
      id: workout.id,
      date: workout.date,
      description: workout.description,
      comment: workout.comment,
      isTime: workout.isTime,
      numberValue: workout.numberValue,
      value: workout.value,
      minScore: minSq.minScore,
      maxScore: maxSq.maxScore,
    })
    .from(workout)
    .where(eq(workout.userId, dbUser.id))
    .leftJoin(minSq, eq(minSq.description, sql`lower(${workout.description})`))
    .leftJoin(maxSq, eq(maxSq.description, sql`lower(${workout.description})`))
    .orderBy(desc(workout.date));

  return await workouts;
}

export type QueryWorkout = Awaited<ReturnType<typeof getWorkouts>>[0];
