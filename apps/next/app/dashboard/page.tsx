import { trpc } from "@/trpc/server";
import { CreateWorkout } from "./components/CreateWorkout";
import { Workouts } from "./components/Workouts";

export default async function Page() {
  const [workouts, user] = await Promise.all([
    trpc.workouts.query(),
    trpc.user.query(),
  ]);
  return (
    <div className="py-4 sm:py-8 mx-auto max-w-lg text-gray-300 flex flex-col h-screen">
      <header className="flex justify-between">
        <h1 className="font-extrabold uppercase">Gymrat</h1>
        <p className="text-neutral-500">{user.clerk?.email}</p>
      </header>
      <div className="my-4 sm:my-8 flex flex-col gap-4 sm:gap-8 grow">
        <CreateWorkout workouts={workouts} data-superjson />
        <Workouts initialData={workouts} data-superjson />
      </div>
      <footer>
        <p className="text-xs text-neutral-700">{user.apiKey}</p>
      </footer>
    </div>
  );
}
