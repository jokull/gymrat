import { format, isSameWeek, isToday, isYesterday } from "date-fns";

import { DateInput } from "~/components/date-input";
import type { QueryWorkout } from "~/db/queries";
import { useUpdateWorkout } from "~/lib/use-workouts";
import { formatTimeAgo } from "~/utils/timeago";

export function getTimeAgoLabel(date: Date) {
	const today = new Date();

	return isToday(date)
		? "today"
		: isYesterday(date)
			? "yesterday"
			: isSameWeek(date, today)
				? formatTimeAgo(date)
				: // Deterministic Icelandic-style date; toLocaleDateString output
					// varies with the runtime's ICU data and breaks SSR hydration
					format(date, "d.M.yyyy");
}

export function TimeAgo({
	workout,
	editable = true,
}: {
	workout: QueryWorkout;
	editable?: boolean;
}) {
	const mutation = useUpdateWorkout();

	const label = getTimeAgoLabel(workout.date);

	return editable ? (
		<DateInput
			initial={workout.date}
			onChange={(date) => {
				mutation.mutate({ id: workout.id, date: date.toISOString() });
			}}
		>
			{label}
		</DateInput>
	) : (
		<>{label}</>
	);
}
