"use client";

import { Portal, RadioGroup } from "@headlessui/react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useState } from "react";

import { getTimeAgoLabel, TimeAgo } from "~/app/dashboard/_components/time-ago";
import { QueryWorkout } from "~/db/queries";
import { cn } from "~/utils/classnames";

import { Comment } from "./comment";
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
}: {
  workout: QueryWorkout;
  active: boolean;
  checked: boolean;
}) {
  return (
    <div className="flex items-stretch gap-4">
      <div className="flex min-w-0 grow items-center gap-2 truncate group-data-active:whitespace-normal">
        <div>{workout.description}</div>
        <div className="opacity-50">{getTimeAgoLabel(workout.date)}</div>
        {workout.comment?.trim() ? (
          <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
        ) : null}
      </div>
      <div className="flex items-end gap-2">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <TopScore workout={workout} />
          <span className="font-medium">{workout.value}</span>
        </div>
      </div>
    </div>
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
    <>
      <Portal>
        {workout && editable ? (
          <div
            key={workout.id}
            className="fixed inset-x-0 bottom-0 w-full bg-neutral-600/30 text-white backdrop-blur-lg"
          >
            <div className="absolute -top-px h-px w-full overflow-hidden">
              <div className="absolute -top-6 h-12 w-full bg-white/20 backdrop-blur-md backdrop-brightness-200 backdrop-contrast-150" />
            </div>
            <div className="mx-auto max-w-lg px-4 py-4 md:px-2">
              <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <TimeAgo workout={workout} editable={true} />
                <div className="text-neutral-500">{workout.description}</div>
                <div className="flex justify-end">
                  <DeleteWorkout workout={workout} />
                </div>
              </div>
              <div className="mb-2">
                <Comment workout={workout} />
              </div>
            </div>
          </div>
        ) : null}
      </Portal>
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
                  workout?.id === w.id
                    ? "bg-white/10 text-neutral-100 shadow-[0_0_2px_0_white]"
                    : matchingWorkoutIsSelected
                    ? "text-neutral-200"
                    : "text-neutral-400",
                )}
              >
                {({ active, checked }) => (
                  <WorkoutRow active={active} checked={checked} workout={w} />
                )}
              </RadioGroup.Option>
            );
          })}
        </LayoutGroup>
      </RadioGroup>
    </>
  );
}
