// import { type Workout } from "@gymrat/api";

import { trpc } from "@/trpc/server";

import { DataCreateWorkout } from "./components/CreateWorkout";
import { DataWorkouts } from "./components/Workouts";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [workouts, user] = await Promise.all([
    trpc.workouts.query(),
    trpc.user.query(),
  ]);
  // const workouts: Workout[] = [];
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grow flex flex-col gap-4">
        <DataCreateWorkout workouts={workouts} data-superjson />
        <DataWorkouts initialData={[]} data-superjson />
      </div>
      <footer>
        <p className="text-xs text-neutral-600 text-center">{user.apiKey}</p>
      </footer>
    </div>
  );
}
