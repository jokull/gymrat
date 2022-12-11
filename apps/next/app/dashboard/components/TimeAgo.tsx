"use client";
import DateInput from "@/components/DateInput";
import { trpc } from "@/trpc/client";
import { formatTimeAgo } from "@/utils/timeago";
import { type Workout } from "api/db";

const DAY_IN_MILLISECONDS = 86_400_000;
const WEEK_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 7;

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
      utils.workouts.refetch();
    },
  });
  const diff = new Date().valueOf() - workout.date.valueOf();
  const label =
    diff < DAY_IN_MILLISECONDS
      ? "today"
      : diff < WEEK_IN_MILLISECONDS
      ? formatTimeAgo(workout.date)
      : workout.date.toLocaleDateString("is-IS");
  return editable ? (
    <DateInput
      initial={workout.date}
      onChange={(date) =>
        updateWorkout.mutateAsync({ id: workout.id, fields: { date } })
      }
    >
      {label}
    </DateInput>
  ) : (
    <>{label}</>
  );
}
