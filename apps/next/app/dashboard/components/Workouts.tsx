"use client";

import { trpc } from "@/trpc/client";
import { RadioGroup } from "@headlessui/react";
import { StarIcon as OutlineStarIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { inferRouterOutputs } from "@trpc/server";
import { type Workout } from "api/db";
import { type AppRouter } from "api/router";
import classNames from "classnames";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useState } from "react";
import { DeleteWorkout } from "./DeleteWorkout";
import { TimeAgo } from "./TimeAgo";

export type RouterOutput = inferRouterOutputs<AppRouter>;

type Props = {
  initialData: RouterOutput["workouts"];
};

function TopScore({ workout }: { workout: Workout }) {
  return (
    <AnimatePresence>
      {workout.topScore === workout.numberValue ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          exit={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1.1 }}
          transition={{
            damping: 5,
          }}
        >
          <StarIcon className="w-4 h-4 text-yellow-500 hidden group-data-active:block" />
          <OutlineStarIcon className="w-4 h-4 text-neutral-300 block group-data-active:hidden" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Workouts({ initialData }: Props) {
  const { data } = trpc.workouts.useQuery(undefined, {
    initialData: initialData,
  });
  const workouts = data ?? [];
  const [workout, setWorkout] = useState(workouts[0]);
  return (
    <RadioGroup
      value={workout}
      onChange={setWorkout}
      className="flex flex-col gap-1"
    >
      <LayoutGroup>
        {workouts?.map((workout) => (
          <RadioGroup.Option
            value={workout}
            key={workout.id}
            as={motion.div}
            layout
            className={classNames(
              "cursor-pointer hover:bg-neutral-900 data-active:bg-neutral-800 -mx-2 p-2 rounded-md group"
            )}
          >
            {() => (
              <>
                {/* Mobile layout */}
                <div className="flex mobile:hidden items-start gap-2">
                  <div className="flex flex-col gap-1 grow min-w-0">
                    <div>{workout.description}</div>
                    <div className="text-neutral-500 whitespace-nowrap">
                      <TimeAgo workout={workout} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <TopScore workout={workout} />
                      <span className="font-medium">{workout.value}</span>
                    </div>
                    <div className="items-center gap-2 shrink-0">
                      <DeleteWorkout workout={workout} />
                    </div>
                  </div>
                </div>
                {/* Desktop layout */}
                <div className="hidden mobile:flex items-stretch gap-4">
                  <div className="flex items-center grow min-w-0 truncate group-data-active:whitespace-normal">
                    {workout.description}
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <TopScore workout={workout} />
                      <span className="font-medium">{workout.value}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-neutral-500 whitespace-nowrap">
                        <TimeAgo workout={workout} />
                      </div>
                      <DeleteWorkout workout={workout} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </LayoutGroup>
    </RadioGroup>
  );
}
