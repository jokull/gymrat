import { redirect } from "next/navigation";

import { createWorkout } from "~/db/actions";
import { getWorkouts, QueryWorkout } from "~/db/queries";
import { getLoginContext } from "~/utils/session";

import { CreateWorkout } from "./_components/create-workout";
import { Workouts } from "./_components/workouts-";

export const dynamic = "force-dynamic";

function getItemsFromWorkouts(workouts: QueryWorkout[]) {
  const choices: { id: string; description: string }[] = [];
  workouts.forEach(({ description }) => {
    if (
      !choices.find(
        (name) => name.id === description.toLocaleLowerCase().trim(),
      )
    ) {
      choices.push({
        id: description.toLocaleLowerCase().trim(),
        description: description,
      });
    }
  });
  return choices.map(({ description }) => ({ description }));
}

export default async function Page() {
  const { dbUser, db } = await getLoginContext();

  if (!dbUser) {
    redirect("/login");
  }

  const workouts = await getWorkouts({ dbUser, db });

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex grow flex-col gap-4">
        <CreateWorkout
          createWorkout={createWorkout}
          workoutDescriptions={getItemsFromWorkouts(workouts)}
        />
        <Workouts workouts={workouts} />
      </div>
      <footer className="text-center text-xs leading-5 text-neutral-600">
        <p className="text-sm text-neutral-400 underline">
          <a href="/workouts.csv">Download CSV</a>
        </p>
        <p className="">{dbUser.apiKey}</p>
      </footer>
    </div>
  );
}
