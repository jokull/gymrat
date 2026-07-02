"use client";

import { Radio, RadioGroup } from "@headlessui/react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { getTimeAgoLabel, TimeAgo } from "~/app/dashboard/_components/time-ago";
import type { QueryWorkout } from "~/db/queries";
import { cn } from "~/utils/classnames";
import { formatTimeAgo } from "~/utils/timeago";

import { Comment } from "./comment";
import { DeleteWorkout } from "./delete-workout";
import { EditValue } from "./edit-value";

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

function getReferenceWorkout(workouts: QueryWorkout[], selected: QueryWorkout) {
	const sameDescription = workouts.filter(
		(w) => w.description.toLocaleLowerCase() === selected.description.toLocaleLowerCase(),
	);
	const index = sameDescription.findIndex((w) => w.id === selected.id);
	if (index === -1) return null;
	// Viewing the most recent entry: reference the previous one.
	// Viewing an older entry: reference the most recent one.
	return (index === 0 ? sameDescription[1] : sameDescription[0]) ?? null;
}

function ReferenceScore({ reference }: { reference: QueryWorkout }) {
	return (
		<div className="text-xs text-slate-500">
			{formatTimeAgo(reference.date)}: {reference.value}
		</div>
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
	editable = true,
	selected = null,
	onSelect,
}: {
	workouts: QueryWorkout[];
	editable?: boolean;
	selected?: QueryWorkout | null;
	onSelect?: (workout: QueryWorkout | null) => void;
}) {
	const referenceWorkout = selected ? getReferenceWorkout(workouts, selected) : null;

	return (
		<>
			{selected && editable ? (
				<div
					key={selected.id}
					className="fixed inset-x-0 bottom-0 z-50 w-full bg-slate-600/30 text-white backdrop-blur-lg"
				>
					<div className="absolute -top-px h-px w-full overflow-hidden">
						<div className="absolute -top-6 h-12 w-full bg-white/20 backdrop-blur-md backdrop-brightness-200 backdrop-contrast-150" />
					</div>
					<div className="mx-auto max-w-lg px-4 py-4 md:px-2">
						<div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
							<div className="flex items-center gap-2">
								<TimeAgo workout={selected} editable={true} />
								<span className="text-slate-600">·</span>
								<EditValue workout={selected} />
							</div>
							<div className="text-slate-500">{selected.description}</div>
							<div className="flex justify-end">
								<DeleteWorkout workout={selected} />
							</div>
						</div>
						<div className="mb-2">
							<Comment workout={selected} />
						</div>
						{referenceWorkout ? <ReferenceScore reference={referenceWorkout} /> : null}
					</div>
				</div>
			) : null}
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
								className={cn(
									"data-active:bg-white/15 group cursor-pointer rounded-md border-2 p-2 hover:bg-white/10",
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
