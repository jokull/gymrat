"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useCallback, useState } from "react";

import type { QueryWorkout } from "~/db/queries";

export function DeleteWorkout({ workout }: { workout: QueryWorkout }) {
  const router = useRouter();
  const [screen, setScreen] = useState<"default" | "confirm">("default");
  const [isPending, setIsPending] = useState(false);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      setScreen("default");
    }
  }, []);

  const handleDelete = () => {
    setIsPending(true);
    void fetch(`/api/workouts/${workout.id}`, {
      method: "DELETE",
    }).then((res) => {
      if (res.ok) {
        router.refresh();
      }
      setIsPending(false);
    });
  };

  if (screen === "confirm") {
    return (
      <fieldset disabled={isPending} className="flex gap-2">
        <button
          className="rounded px-1.5 text-pink-500 hover:text-pink-700"
          onClick={handleDelete}
          onKeyDown={onKeyDown}
        >
          Delete
        </button>
        <button
          className="rounded px-1.5 text-slate-100 hover:text-slate-400"
          autoFocus
          onClick={() => {
            setScreen("default");
          }}
          onKeyDown={onKeyDown}
        >
          Cancel
        </button>
      </fieldset>
    );
  }
  return (
    <button
      onClick={() => {
        setScreen("confirm");
      }}
    >
      <TrashIcon className="hidden h-6 w-6 text-slate-600" />
      <span className="text-white">Delete</span>
    </button>
  );
}
