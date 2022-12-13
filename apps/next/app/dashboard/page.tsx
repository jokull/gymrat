import { trpc } from "@/trpc/server";
import { DataCreateWorkout } from "./components/CreateWorkout";
import { DataWorkouts } from "./components/Workouts";

export default async function Page() {
  const workouts = await trpc.workouts.query();
  return (
    <div className="my-4 sm:my-8 flex flex-col gap-4 sm:gap-8 grow">
      <DataCreateWorkout workouts={workouts} data-superjson />
      <DataWorkouts initialData={workouts} data-superjson />
    </div>
  );
}
