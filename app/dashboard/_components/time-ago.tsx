"use client";

import { isSameWeek, isToday, isYesterday } from "date-fns";
import { useRouter } from "next/navigation";

import { DateInput } from "~/components/date-input";
import type { QueryWorkout } from "~/db/queries";
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
  const router = useRouter();

  const label = getTimeAgoLabel(workout.date);

  return editable ? (
    <DateInput
      initial={workout.date}
      onChange={(date) => {
        void fetch(`/api/workouts/${workout.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: date.toISOString() }),
        }).then(() => {
          router.refresh();
        });
      }}
    >
      {label}
    </DateInput>
  ) : (
    <>{label}</>
  );
}
