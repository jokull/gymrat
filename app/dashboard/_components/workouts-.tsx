"use client";

import { RadioGroup } from "@headlessui/react";
import { StarIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useState } from "react";

import { TimeAgo } from "~/app/dashboard/_components/time-ago";
import { QueryWorkout } from "~/db/queries";
import { cn } from "~/utils/classnames";

import { DeleteWorkout } from "./delete-workout";

function TopScore({ workout }: { workout: QueryWorkout }) {
  const score = workout.isTime ? workout.minScore : workout.maxScore;
  return (
    <AnimatePresence>
      {score === workout.numberValue ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          exit={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1.1 }}
          transition={{ damping: 5 }}
        >
          <StarIcon className="h-4 w-4 text-neutral-400 group-data-active:text-yellow-500 group-data-workout:text-yellow-500" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function WorkoutRow({
  workout,
  editable,
}: {
  workout: QueryWorkout;
  editable: boolean;
}) {
  return (
    <>
      {/* Mobile layout */}
      <div className="flex items-start gap-2 mobile:hidden">
        <div className="flex min-w-0 grow flex-col gap-1">
          <div>{workout.description}</div>
          <div className="whitespace-nowrap text-neutral-500">
            <TimeAgo workout={workout} editable={editable} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <TopScore workout={workout} />
            <span className="font-medium">{workout.value}</span>
          </div>
          <div className="shrink-0 items-center gap-2">
            {editable ? <DeleteWorkout workout={workout} /> : null}
          </div>
        </div>
      </div>
      {/* Desktop layout */}
      <div className="hidden items-stretch gap-4 mobile:flex">
        <div className="flex min-w-0 grow items-center truncate group-data-active:whitespace-normal">
          {workout.description}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <TopScore workout={workout} />
            <span className="font-medium">{workout.value}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="whitespace-nowrap text-neutral-500">
              <TimeAgo workout={workout} editable={editable} />
            </div>
            {editable ? <DeleteWorkout workout={workout} /> : null}
          </div>
        </div>
      </div>
    </>
  );
}

export function Workouts({
  workouts,
  editable = true,
}: {
  workouts: QueryWorkout[];
  editable?: boolean;
}) {
  const [workout, setWorkout] = useState(workouts[0] ?? null);
  return (
    <RadioGroup
      value={workout}
      onChange={setWorkout}
      className="flex flex-col gap-1"
    >
      <LayoutGroup>
        {workouts.map((w) => {
          const matchingWorkoutIsSelected =
            workout?.description.toLocaleLowerCase() ===
            w.description.toLocaleLowerCase();
          return (
            <RadioGroup.Option
              value={w}
              key={w.id}
              as={motion.div}
              layout
              data-workout={matchingWorkoutIsSelected ? "true" : "false"}
              className={cn(
                "data-active:bg-white/15 group cursor-pointer rounded-md p-2 hover:bg-white/10",
                matchingWorkoutIsSelected
                  ? "bg-white/10 text-neutral-100"
                  : "text-neutral-400",
              )}
            >
              {() => <WorkoutRow workout={w} editable={editable} />}
            </RadioGroup.Option>
          );
        })}
      </LayoutGroup>
    </RadioGroup>
  );
}
