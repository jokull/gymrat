"use client";

import type { QueryWorkout } from "~/db/queries";
import { useWorkouts } from "~/lib/use-workouts";

import { CreateWorkout } from "./create-workout";
import { Workouts } from "./workouts-";

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

export function Dashboard({
  workouts: initialWorkouts,
  apiKey,
}: {
  workouts: QueryWorkout[];
  apiKey: string;
}) {
  const { data: workouts } = useWorkouts(initialWorkouts);

  return (
    <div className="flex h-full flex-col gap-4 pb-64">
      <div className="flex grow flex-col gap-8">
        <CreateWorkout workoutDescriptions={getItemsFromWorkouts(workouts)} />
        <Workouts workouts={workouts} />
      </div>
      <footer className="text-center text-xs leading-5 text-slate-600">
        <p className="text-sm text-slate-400 underline">
          <a href="/workouts.csv">Download CSV</a>
        </p>
        <p className="">{apiKey}</p>
      </footer>
    </div>
  );
}
