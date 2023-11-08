"use client";

import { isSameWeek, isToday, isYesterday } from "date-fns";

import DateInput from "~/components/DateInput";
import { QueryWorkout } from "~/db/queries";
import { formatTimeAgo } from "~/utils/timeago";

export function TimeAgo({
  workout,
  editable = true,
}: {
  workout: QueryWorkout;
  editable?: boolean;
}) {
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
      onChange={(date) =>
        void updateWorkout.mutateAsync({ id: workout.id, fields: { date } })
      }
    >
      {label}
    </DateInput>
  ) : (
    <>{label}</>
  );
}
