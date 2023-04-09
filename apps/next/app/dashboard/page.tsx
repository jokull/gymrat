import superjson from "superjson";

import { trpc } from "@/trpc/server";

import { DataCreateWorkout } from "./components/CreateWorkout";
import { DataWorkouts } from "./components/Workouts";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [workouts, user] = await Promise.all([
    trpc.workouts.query(),
    trpc.user.query(),
  ]);
  const serializedWorkouts = superjson.serialize(workouts);
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grow flex flex-col gap-4">
        <DataCreateWorkout serializedWorkouts={serializedWorkouts} />
        <DataWorkouts initialData={[]} />
      </div>
      <footer className="leading-5 text-xs text-neutral-600 text-center">
        <p className="underline text-sm text-neutral-400">
          <a href="/workouts.csv">Download CSV</a>
        </p>
        <p className="">{user.apiKey}</p>
      </footer>
    </div>
  );
}
