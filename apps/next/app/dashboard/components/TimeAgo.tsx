"use client";
import { type Workout } from "@gymrat/api";
import { isSameWeek, isToday, isYesterday } from "date-fns";
import { useEffect, useState } from "react";

import DateInput from "@/components/DateInput";
import { trpc } from "@/trpc/client";
import { formatTimeAgo } from "@/utils/timeago";

export function TimeAgo({
  workout,
  editable = true,
}: {
  workout: Workout;
  editable?: boolean;
}) {
  const utils = trpc.useContext();
  const updateWorkout = trpc.updateWorkout.useMutation({
    onSuccess: () => {
      void utils.workouts.refetch();
    },
  });
  const today = new Date();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const label = isToday(workout.date)
    ? "today"
    : isYesterday(workout.date)
    ? "yesterday"
    : isSameWeek(workout.date, today)
    ? formatTimeAgo(workout.date)
    : isMounted
    ? workout.date.toLocaleDateString("is-IS")
    : String(workout.date);

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
