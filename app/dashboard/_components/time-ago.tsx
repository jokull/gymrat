"use client";

import { isSameWeek, isToday, isYesterday } from "date-fns";
import { useTransition } from "react";

import DateInput from "~/components/date-input";
import { updateWorkout } from "~/db/actions";
import { QueryWorkout } from "~/db/queries";
import { formatTimeAgo } from "~/utils/timeago";

export function TimeAgo({
  workout,
  editable = true,
}: {
  workout: QueryWorkout;
  editable?: boolean;
}) {
  const [, startTransition] = useTransition();

  const today = new Date();

  const label = isToday(workout.date)
    ? "today"
    : isYesterday(workout.date)
    ? "yesterday"
    : isSameWeek(workout.date, today)
    ? formatTimeAgo(workout.date)
    : workout.date.toLocaleDateString("is-IS");

  return editable ? (
    <DateInput
      initial={workout.date}
      onChange={(date) => {
        const formData = new FormData();
        formData.append("id", workout.id);
        formData.append("date", date.toISOString());
        startTransition(() => {
          void updateWorkout(null, formData);
        });
        return;
      }}
    >
      {label}
    </DateInput>
  ) : (
    <>{label}</>
  );
}
