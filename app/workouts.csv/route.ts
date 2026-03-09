import { redirect } from "next/navigation";

import { getWorkouts } from "~/db/queries";
import { getLoginContext } from "~/utils/session";

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function getWorkoutsData() {
  const { dbUser, db } = await getLoginContext();
  if (!dbUser) {
    redirect("/");
  }
  const workouts = await getWorkouts({ dbUser, db });
  return workouts.map(
    ({ maxScore, minScore, isTime, numberValue, ...workout }) => ({
      isTopScore: (isTime ? minScore : maxScore) === numberValue,
      numberValue,
      ...workout,
    }),
  );
}

type Workout = Awaited<ReturnType<typeof getWorkoutsData>>[0];

function jsonToCsv(workouts: Workout[]): string {
  const headers = [
    "id",
    "numberValue",
    "date",
    "description",
    "isTopScore",
    "value",
  ] as const;
  const rows = workouts.map((workout) =>
    headers.map((header) => {
      let value = workout[header];
      if (value instanceof Date) {
        value = formatDate(value);
      }
      return String(value);
    }),
  );

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export async function GET() {
  const body = jsonToCsv(await getWorkoutsData());
  return new Response(body, {
    headers: {
      "content-type": "text/csv;charset=utf-8;",
      "cache-control": "no-cache, no-store, max-age=0",
      "content-disposition": "attachment; filename=gymrat-workouts.csv",
    },
  });
}
