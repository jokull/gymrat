"use client";

import { Ghost, Primary } from "@/components/Button";
import { trpc } from "@/trpc/client";
import { formatTimeAgo } from "@/utils/timeago";
import { RadioGroup } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "api/router";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type RouterOutput = inferRouterOutputs<AppRouter>;

function DeleteWorkout({ workout }: { workout: RouterOutput["workouts"][0] }) {
  const utils = trpc.useContext();
  const deleteWorkout = trpc.deleteWorkout.useMutation();
  const [screen, setScreen] = useState<"default" | "confirm">("default");
  if (screen === "confirm") {
    return (
      <fieldset disabled={deleteWorkout.isLoading} className="flex gap-2">
        <Ghost
          autoFocus
          onClick={() => {
            setScreen("default");
          }}
        >
          Cancel
        </Ghost>
        <Primary
          onClick={() => {
            // Optimistic update
            utils.workouts.setData(undefined, (oldData) =>
              oldData?.filter(({ id }) => id !== workout.id)
            );
            // Mutation
            deleteWorkout.mutateAsync(workout.id).then(() => {
              // And the refetch
              utils.workouts.refetch();
            });
          }}
        >
          Delete
        </Primary>
      </fieldset>
    );
  }
  return (
    <button
      onClick={() => {
        setScreen("confirm");
      }}
    >
      <TrashIcon className="w-6 h-6 text-neutral-600" />
    </button>
  );
}

type Props = {
  initialData: RouterOutput["workouts"];
};

const WEEK_IN_MILLISECONDS = 604_800_000;

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
      {workouts?.map((workout) => (
        <RadioGroup.Option
          value={workout}
          key={workout.id}
          className={classNames(
            "flex items-start gap-4",
            "cursor-pointer data-active:bg-neutral-800 -mx-2 p-2 rounded-md group"
          )}
        >
          {({ checked }) => (
            <>
              <div className="grow min-w-0 truncate group-data-active:whitespace-normal">
                {workout.description}
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <AnimatePresence>
                  {workout.topScore === workout.numberValue ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "tween",
                        ease: "anticipate",
                        duration: 0.4,
                      }}
                    >
                      <StarIcon className="w-4 h-4 text-neutral-200 group-data-active:text-yellow-400" />
                    </motion.div>
                  ) : null}
                </AnimatePresence>{" "}
                {workout.value}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-neutral-500 whitespace-nowrap">
                  {new Date().valueOf() - workout.date.valueOf() <
                  WEEK_IN_MILLISECONDS
                    ? formatTimeAgo(workout.date)
                    : workout.date.toLocaleDateString("is-IS")}
                </div>
                <DeleteWorkout workout={workout} />
              </div>
            </>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
}
