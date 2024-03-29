import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cacheHeader } from "pretty-cache-header";

import { getWorkouts } from "~/db/queries";
import { getLoginContext } from "~/utils/session";

export const dynamic = "force-dynamic";
export const runtime = "edge";

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
  const response = new NextResponse(body, {
    headers: {
      "content-type": "text/csv;charset=utf-8;",
      "cache-control": cacheHeader({
        noCache: true,
        noStore: true,
        maxAge: "0m",
      }),
      "content-disposition": "attachment; filename=gymrat-workouts.csv",
    },
  });
  return response;
}
