import { Radio, RadioGroup } from "@headlessui/react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { getTimeAgoLabel } from "./time-ago";
import type { QueryWorkout } from "~/db/queries";
import { cn } from "~/utils/classnames";

function TopScore({ workout }: { workout: QueryWorkout }) {
	const score = workout.isTime ? workout.minScore : workout.maxScore;
	return (
		<AnimatePresence>
			{score === workout.numberValue ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.5 }}
					exit={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1.1 }}
					transition={{ damping: 5 }}
				>
					<StarIcon className="h-4 w-4 text-slate-400 group-data-active:text-yellow-500 group-data-workout:text-yellow-500" />
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}

export function WorkoutRow({
	workout,
}: {
	workout: QueryWorkout;
	active: boolean;
	checked: boolean;
}) {
	return (
		<div className="flex items-stretch gap-4">
			<div className="flex min-w-0 grow items-center gap-2 truncate group-data-active:whitespace-normal">
				<div>{workout.description}</div>
				<div className="opacity-50">{getTimeAgoLabel(workout.date)}</div>
				{workout.comment?.trim() ? (
					<ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
				) : null}
			</div>
			<div className="flex items-end gap-2">
				<div className="flex items-center gap-2 whitespace-nowrap">
					<TopScore workout={workout} />
					<span className="font-medium">{workout.value}</span>
				</div>
			</div>
		</div>
	);
}

export function Workouts({
	workouts,
	selected = null,
	onSelect,
}: {
	workouts: QueryWorkout[];
	selected?: QueryWorkout | null;
	onSelect?: (workout: QueryWorkout | null) => void;
}) {
	return (
		<>
			<RadioGroup
				value={selected}
				onChange={(value) => {
					onSelect?.(value);
				}}
				className="flex flex-col gap-1"
			>
				<LayoutGroup>
					{workouts.map((w) => {
						const matchingWorkoutIsSelected =
							selected?.description.toLocaleLowerCase() ===
							w.description.toLocaleLowerCase();
						return (
							<Radio
								value={w}
								key={w.id}
								as={motion.div}
								layout
								data-workout={matchingWorkoutIsSelected ? "true" : "false"}
								// the dock opens over the foot of the list: bring the row up clear of it
								onClick={(event) => {
									event.currentTarget.scrollIntoView({
										block: "nearest",
										behavior: "smooth",
									});
								}}
								className={cn(
									"data-active:bg-white/15 group cursor-pointer scroll-mb-88 rounded-md border-2 p-2 hover:bg-white/10",
									selected?.id === w.id
										? "border-slate-700 bg-white/10 text-slate-100"
										: matchingWorkoutIsSelected
											? "border-transparent text-slate-200"
											: "border-transparent text-slate-400",
								)}
							>
								<WorkoutRow active={false} checked={false} workout={w} />
							</Radio>
						);
					})}
				</LayoutGroup>
			</RadioGroup>
		</>
	);
}
