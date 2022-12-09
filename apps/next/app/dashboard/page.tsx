import { trpc } from "@/trpc/server";
import { CreateWorkout } from "./components/CreateWorkout";
import { Workouts } from "./components/Workouts";

export default async function Page() {
  const [workouts, user] = await Promise.all([
    trpc.workouts.query(),
    trpc.user.query(),
  ]);
  return (
    <div className="my-8 mx-auto max-w-lg text-gray-300">
      <h1>Workouts</h1>
      <p>{user.clerk?.email}</p>
      <p>Token: {user.apiKey}</p>
      <div className="my-4 flex flex-col gap-4">
        <CreateWorkout workouts={workouts} data-superjson />
        <Workouts initialData={workouts} data-superjson />
      </div>
    </div>
  );
}
