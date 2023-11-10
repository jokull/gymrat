"use client";

import { FocusTrap } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { KeyboardEvent, useCallback, useState, useTransition } from "react";

import { deleteWorkout } from "~/db/actions";
import { QueryWorkout } from "~/db/queries";

export function DeleteWorkout({ workout }: { workout: QueryWorkout }) {
  const [screen, setScreen] = useState<"default" | "confirm">("default");

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      setScreen("default");
    }
  }, []);

  const [isPending, startTransition] = useTransition();

  if (screen === "confirm") {
    return (
      <FocusTrap>
        <fieldset disabled={isPending} className="flex gap-2">
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
              const formData = new FormData();
              formData.append("id", workout.id);
              startTransition(() => {
                void deleteWorkout(null, formData);
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
      <TrashIcon className="hidden h-6 w-6 text-neutral-600 mobile:block" />
      <span className="text-red-300/50 mobile:hidden">Delete</span>
    </button>
  );
}
