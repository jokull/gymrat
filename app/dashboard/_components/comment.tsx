"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Secondary } from "~/components/button-";
import { Input } from "~/components/input-";
import type { QueryWorkout } from "~/db/queries";

export function Comment({ workout }: { workout: QueryWorkout }) {
  const router = useRouter();
  const [value, setValue] = useState(workout.comment ?? "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void fetch(`/api/workouts/${workout.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: value }),
    }).then(() => {
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <Input
        className="w-full grow"
        name="comment"
        placeholder="Add a comment"
        defaultValue={workout.comment ?? ""}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      {value !== (workout.comment ?? "") ? <Secondary>Save</Secondary> : null}
    </form>
  );
}
