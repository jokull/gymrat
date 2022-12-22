// import { headers } from "next/headers";

// import { trpc } from "@/trpc/server";

import { DataCreateWorkout } from "./components/CreateWorkout";
import { DataWorkouts } from "./components/Workouts";

export default async function Page() {
  // headers(); // next.js now makes this a dynamic route
  // const [workouts, user] = await Promise.all([
  //   trpc.workouts.query(),
  //   trpc.user.query(),
  // ]);
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grow flex flex-col gap-4">
        <DataCreateWorkout workouts={[]} data-superjson />
        <DataWorkouts initialData={[]} data-superjson />
      </div>
      <footer>
        {/* <p className="text-xs text-neutral-600 text-center">{user.apiKey}</p> */}
      </footer>
    </div>
  );
}
