"use client";
import { trpc } from "@/trpc/client";
import { FocusTrap } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { type Workout } from "api/db";
import { KeyboardEvent, useCallback, useState } from "react";

export function DeleteWorkout({ workout }: { workout: Workout }) {
  const utils = trpc.useContext();
  const deleteWorkout = trpc.deleteWorkout.useMutation();
  const [screen, setScreen] = useState<"default" | "confirm">("default");
  const onKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      setScreen("default");
    }
  }, []);
  if (screen === "confirm") {
    return (
      <FocusTrap>
        <fieldset disabled={deleteWorkout.isLoading} className="flex gap-2">
          <button
            className="rounded px-1.5 text-neutral-100 hover:text-neutral-400"
            autoFocus
            onClick={() => {
              setScreen("default");
            }}
            onKeyDown={onKeyDown}
          >
            Cancel
          </button>
          <button
            className="rounded px-1.5 text-pink-500 hover:text-pink-700"
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
            onKeyDown={onKeyDown}
          >
            Delete
          </button>
        </fieldset>
      </FocusTrap>
    );
  }
  return (
    <button
      onClick={() => {
        setScreen("confirm");
      }}
    >
      <TrashIcon className="w-6 h-6 text-neutral-600 hidden mobile:block" />
      <span className="mobile:hidden text-red-300/50">Delete</span>
    </button>
  );
}
