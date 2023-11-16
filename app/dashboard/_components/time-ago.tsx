"use client";

import { isSameWeek, isToday, isYesterday } from "date-fns";
import { useTransition } from "react";

import { DateInput } from "~/components/date-input";
import { updateWorkout } from "~/db/actions";
import { QueryWorkout } from "~/db/queries";
import { formatTimeAgo } from "~/utils/timeago";

export function getTimeAgoLabel(date: Date) {
  const today = new Date();

  return isToday(date)
    ? "today"
    : isYesterday(date)
    ? "yesterday"
    : isSameWeek(date, today)
    ? formatTimeAgo(date)
    : date.toLocaleDateString("is-IS");
}

export function TimeAgo({
  workout,
  editable = true,
}: {
  workout: QueryWorkout;
  editable?: boolean;
}) {
  const [, startTransition] = useTransition();

  const label = getTimeAgoLabel(workout.date);

  return editable && updateWorkout ? (
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
