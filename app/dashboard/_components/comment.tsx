"use client";

import { type FormEvent, useState } from "react";

import { Secondary } from "~/components/button-";
import { Input } from "~/components/input-";
import type { QueryWorkout } from "~/db/queries";
import { useUpdateWorkout } from "~/lib/use-workouts";

export function Comment({ workout }: { workout: QueryWorkout }) {
  const mutation = useUpdateWorkout();
  const [value, setValue] = useState(workout.comment ?? "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ id: workout.id, comment: value });
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
