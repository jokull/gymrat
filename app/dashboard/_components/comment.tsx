"use client";

import { useActionState, useState } from "react";

import { Secondary } from "~/components/button-";
import { Input } from "~/components/input-";
import { updateWorkout } from "~/db/actions";
import type { QueryWorkout } from "~/db/queries";

export function Comment({ workout }: { workout: QueryWorkout }) {
  const [, action] = useActionState(updateWorkout, null);
  const [value, setValue] = useState(workout.comment ?? "");
  return (
    <form action={action} className="flex w-full gap-2">
      <input type="hidden" name="id" value={workout.id} />
      <Input
        className="w-full grow"
        name="comment"
        placeholder="Add a comment"
        defaultValue={workout.comment ?? ""}
        onChange={(event) =>{  setValue(event.target.value); }}
      />
      {value !== (workout.comment ?? "") ? <Secondary>Save</Secondary> : null}
    </form>
  );
}
