import { BoltIcon, ClockIcon, StarIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";

import type { QueryWorkout } from "~/db/queries";
import { cn } from "~/utils/classnames";
import {
	formatScore,
	getStanding,
	getUnitSuffix,
	isBareNumber,
	type Standing,
} from "~/utils/entry";
import { formatTimeAgo } from "~/utils/timeago";
import { getNumberValue } from "~/utils/workouts";

import { Comment } from "./comment";
import { DeleteWorkout } from "./delete-workout";
import { EditValue } from "./edit-value";
import { TimeAgo } from "./time-ago";

export const EASE = [0.23, 1, 0.32, 1] as const;

/** Every score logged for one workout, newest first. */
export interface Lift {
	description: string;
	entries: QueryWorkout[];
}

/** The unit a bare number can take on: the one this workout was last logged in. */
export function getArmableSuffix(value: string, lift: Lift | null) {
	if (!lift || !isBareNumber(value)) return null;
	for (const entry of lift.entries) {
		const suffix = getUnitSuffix(entry.value);
		if (suffix !== null) return suffix;
	}
	return null;
}

function getReferenceWorkout(entries: QueryWorkout[], selected: QueryWorkout) {
	const index = entries.findIndex((w) => w.id === selected.id);
	if (index === -1) return null;
	// Viewing the most recent entry: reference the previous one.
	// Viewing an older entry: reference the most recent one.
	return (index === 0 ? entries[1] : entries[0]) ?? null;
}

/** Characters that roll in one by one, so a score reads as being dialled in. */
function Digits({ text }: { text: string }) {
	return (
		<span className="relative inline-flex" aria-label={text}>
			<AnimatePresence mode="popLayout" initial={false}>
				{text.split("").map((char, index) => (
					<motion.span
						// oxlint-disable-next-line react/no-array-index-key -- a digit is its place and its face
						key={`${index}${char}`}
						aria-hidden
						className="inline-block"
						initial={{ opacity: 0, transform: "translateY(25%)" }}
						animate={{ opacity: 1, transform: "translateY(0%)" }}
						exit={{ opacity: 0, transform: "translateY(-25%)" }}
						transition={{ duration: 0.14, ease: EASE }}
					>
						{char}
					</motion.span>
				))}
			</AnimatePresence>
		</span>
	);
}

type UnitTone = "idle" | "on" | "armed" | "off";

/** The unit beside the score. A bare number arms the workout's usual unit; a tap disarms it. */
function UnitPill({
	label,
	tone,
	isTime,
	onToggle,
}: {
	label: string;
	tone: UnitTone;
	isTime: boolean;
	onToggle?: () => void;
}) {
	const toggles = tone === "armed" || tone === "off";
	const Icon = isTime ? ClockIcon : BoltIcon;
	return (
		<button
			type="button"
			disabled={!toggles}
			onMouseDown={(event) => {
				event.preventDefault();
			}}
			onClick={onToggle}
			aria-pressed={toggles ? tone === "armed" : undefined}
			aria-label={toggles ? `Add ${label} to the score` : undefined}
			className={cn(
				"relative isolate inline-flex h-7 items-center gap-1 overflow-hidden rounded-full px-2.5 text-[13px] font-semibold",
				"transition-[color,border-color,scale] duration-150 ease-out select-none",
				"border",
				tone === "idle" && "border-dashed border-slate-600 text-slate-500",
				tone === "on" && "border-transparent text-white",
				tone === "armed" && "border-transparent text-white active:scale-[0.96]",
				tone === "off" &&
					"border-slate-600 text-slate-500 line-through active:scale-[0.96]",
			)}
		>
			{/* the charge sweeps in from the number's side */}
			<span
				aria-hidden
				className={cn(
					"absolute inset-0 -z-10 transition-[clip-path,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
					tone === "armed" ? "bg-pink-500" : isTime ? "bg-sky-500/80" : "bg-white/15",
					tone === "on" || tone === "armed"
						? "[clip-path:inset(0_0_0_0)]"
						: "[clip-path:inset(0_100%_0_0)]",
				)}
			/>
			<AnimatePresence initial={false} mode="popLayout">
				{tone === "armed" || (tone === "on" && isTime) ? (
					<motion.span
						key="icon"
						initial={{ opacity: 0, transform: "scale(0.8) rotate(-30deg)" }}
						animate={{ opacity: 1, transform: "scale(1) rotate(0deg)" }}
						exit={{ opacity: 0, transform: "scale(0.8) rotate(-30deg)" }}
						transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
					>
						<Icon className="h-3 w-3" />
					</motion.span>
				) : null}
			</AnimatePresence>
			<motion.span layout="position" transition={{ duration: 0.2, ease: EASE }}>
				{label}
			</motion.span>
		</button>
	);
}

/** Lights up when the score beats the workout's best. */
function PRBadge({ on }: { on: boolean }) {
	return (
		<div
			className={cn(
				"relative flex h-7 items-center gap-1 rounded-full pr-2.5 pl-1.5 text-[13px] font-bold",
				"transition-[background-color,color] duration-200 ease-out",
				on ? "bg-yellow-400/15 text-yellow-400" : "bg-white/5 text-slate-600",
			)}
		>
			<span className="relative flex h-4 w-4 items-center justify-center">
				<AnimatePresence>
					{on ? (
						<motion.span
							key="burst"
							aria-hidden
							className="absolute inset-0 rounded-full bg-yellow-400"
							initial={{ opacity: 0.6, transform: "scale(0.8)" }}
							animate={{ opacity: 0, transform: "scale(3.2)" }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5, ease: EASE }}
						/>
					) : null}
				</AnimatePresence>
				<motion.span
					className="relative"
					initial={false}
					animate={{
						transform: on ? "scale(1) rotate(0deg)" : "scale(0.8) rotate(-72deg)",
					}}
					transition={{ type: "spring", duration: 0.5, bounce: on ? 0.3 : 0 }}
				>
					<StarIcon className="h-4 w-4" />
				</motion.span>
			</span>
			PR
		</div>
	);
}

/** The workout's recent scores, with the one being typed taking its place at the end. */
function History({
	entries,
	incoming,
	standing,
	selectedId,
	isTime,
}: {
	isTime: boolean;
	entries: QueryWorkout[];
	incoming: number | null;
	standing: Standing | null;
	selectedId?: string;
}) {
	const scores = entries.map((entry) => entry.numberValue);
	if (incoming !== null) scores.push(incoming);
	if (scores.length === 0) return null;
	const top = Math.max(...scores);
	const floor = Math.min(...scores);
	// Scores sit close together, so the bars span the range they cover and not the way down to zero.
	// A faster time stands taller, the same as a heavier lift.
	const scale = (n: number) =>
		top === floor ? 1 : 0.3 + (0.7 * (isTime ? top - n : n - floor)) / (top - floor);
	const best = standing?.best ?? null;
	return (
		<div className="relative flex h-14 items-end gap-1" aria-hidden>
			{best !== null ? (
				<motion.div
					className="absolute inset-x-0 bottom-0 border-t border-dashed border-slate-600"
					initial={false}
					animate={{
						transform: `translateY(-${Math.min(1, Math.max(0, scale(best))) * 56}px)`,
					}}
					transition={{ type: "spring", duration: 0.4, bounce: 0 }}
				/>
			) : null}
			<AnimatePresence initial={false} mode="popLayout">
				{entries.map((entry) => (
					<motion.div
						key={entry.id}
						layout="position"
						className={cn(
							"h-full w-2 origin-bottom rounded-[2px] transition-colors duration-200",
							entry.id === selectedId
								? "bg-white"
								: entry.numberValue === best
									? "bg-slate-400"
									: "bg-slate-600",
						)}
						initial={{ opacity: 0, transform: "scaleY(0.05)" }}
						animate={{
							opacity: 1,
							transform: `scaleY(${scale(entry.numberValue)})`,
						}}
						exit={{ opacity: 0 }}
						transition={{ type: "spring", duration: 0.4, bounce: 0 }}
					/>
				))}
				{incoming !== null ? (
					<motion.div
						key="incoming"
						className={cn(
							"h-full w-2 origin-bottom rounded-[2px] transition-colors duration-200",
							standing?.isPR
								? "bg-yellow-400 shadow-[0_0_12px] shadow-yellow-400/60"
								: "bg-pink-500",
						)}
						initial={{ opacity: 0, transform: "scaleY(0.05)" }}
						animate={{
							opacity: 1,
							transform: `scaleY(${scale(incoming)})`,
						}}
						exit={{ opacity: 0, transform: "scaleY(0.05)" }}
						transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
					/>
				) : null}
			</AnimatePresence>
		</div>
	);
}

export function DockCard({
	lift,
	value,
	armed,
	onToggleArmed,
	selected,
}: {
	/** Null for a workout that hasn't been logged before. */
	lift: Lift | null;
	/** The score as typed. */
	value: string;
	armed: boolean;
	onToggleArmed: () => void;
	selected: QueryWorkout | null;
}) {
	const entries = lift?.entries ?? [];
	const last = entries[0];
	const typed = value.trim() !== "";
	// What the readout shows: the score being typed, the entry being viewed, or the last one as a ghost.
	const source = typed ? null : (selected ?? last ?? null);
	const reading = typed
		? getNumberValue(value)
		: { value: source?.numberValue ?? 0, isTime: source?.isTime ?? false };
	const { isTime } = reading;

	const armable = typed ? getArmableSuffix(value, lift) : null;
	const written = typed ? getUnitSuffix(value) : source ? getUnitSuffix(source.value) : null;
	const unit: { label: string; tone: UnitTone } | null = isTime
		? { label: "time", tone: typed || selected ? "on" : "idle" }
		: written !== null
			? { label: written.trim(), tone: typed || selected ? "on" : "idle" }
			: armable !== null
				? { label: armable.trim(), tone: armed ? "armed" : "off" }
				: null;

	const standing = typed
		? getStanding(reading.value, isTime, entries)
		: selected
			? getStanding(
					selected.numberValue,
					selected.isTime,
					entries.filter((entry) => entry.id !== selected.id),
				)
			: null;

	const main = typed
		? isTime
			? formatScore(reading.value, true)
			: (value.trim().match(/^\d+(?:[.,]\d+)?/)?.[0] ?? value.trim())
		: source
			? formatScore(source.numberValue, source.isTime)
			: "0";

	const suffix = unit && !isTime && unit.tone !== "off" ? ` ${unit.label}` : "";
	const score = (n: number) => (isTime ? formatScore(n, true) : `${n}${suffix}`);
	const line = standing
		? standing.isPR
			? `Beats your best ${score(standing.best)} by ${score(standing.gap)}`
			: standing.gap === 0
				? `Ties your best ${score(standing.best)}`
				: `${score(standing.gap)} off your best ${score(standing.best)}`
		: typed
			? entries.length > 0
				? `Usually ${last?.isTime ? "a time" : "not timed"}`
				: "First score for this workout"
			: selected
				? "The only entry so far"
				: last
					? `Last ${last.value} · ${formatTimeAgo(last.date)}`
					: "A new workout. Type a score.";

	const comparable = entries
		.filter((entry) => entry.isTime === isTime && entry.numberValue > 0)
		.slice(0, 9)
		.reverse();
	const reference = selected ? getReferenceWorkout(entries, selected) : null;

	return (
		<div className="p-4 pb-3">
			<div className="flex items-end justify-between gap-4">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span
							className={cn(
								"text-[40px] leading-none font-semibold tabular-nums",
								"transition-[color,opacity,font-stretch] duration-200 ease-out",
								source && !selected ? "opacity-30" : "opacity-100",
								standing?.isPR
									? "text-yellow-400 [font-stretch:112%]"
									: "text-white [font-stretch:100%]",
							)}
						>
							<Digits text={main} />
						</span>
						<AnimatePresence initial={false} mode="popLayout">
							{unit ? (
								<motion.div
									key="unit"
									layout="position"
									initial={{ opacity: 0, transform: "scale(0.9)" }}
									animate={{ opacity: 1, transform: "scale(1)" }}
									exit={{ opacity: 0, transform: "scale(0.9)" }}
									transition={{ duration: 0.18, ease: EASE }}
								>
									<UnitPill
										label={unit.label}
										tone={unit.tone}
										isTime={isTime}
										onToggle={onToggleArmed}
									/>
								</motion.div>
							) : null}
							{standing ? (
								<motion.div
									key="pr"
									layout="position"
									initial={{ opacity: 0, transform: "scale(0.9)" }}
									animate={{ opacity: 1, transform: "scale(1)" }}
									exit={{ opacity: 0, transform: "scale(0.9)" }}
									transition={{ duration: 0.18, ease: EASE }}
								>
									<PRBadge on={standing.isPR} />
								</motion.div>
							) : null}
						</AnimatePresence>
					</div>
				</div>
				<History
					entries={comparable}
					incoming={typed && reading.value > 0 ? reading.value : null}
					standing={standing}
					isTime={isTime}
					selectedId={typed ? undefined : selected?.id}
				/>
			</div>

			<div className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/10">
				<motion.div
					className={cn(
						"h-full origin-left rounded-full transition-colors duration-200",
						standing?.isPR ? "bg-yellow-400" : "bg-pink-500",
					)}
					initial={false}
					animate={{ transform: `scaleX(${standing?.progress ?? 0})` }}
					transition={{ type: "spring", duration: 0.4, bounce: 0 }}
				/>
			</div>

			<div className="relative mt-2 h-5 text-[13px] text-slate-400">
				<AnimatePresence initial={false} mode="popLayout">
					<motion.p
						key={line}
						className={cn("truncate", standing?.isPR && "text-yellow-400")}
						initial={{ opacity: 0, transform: "translateY(6px)" }}
						animate={{ opacity: 1, transform: "translateY(0px)" }}
						exit={{ opacity: 0, transform: "translateY(-6px)" }}
						transition={{ duration: 0.18, ease: EASE }}
					>
						{line}
					</motion.p>
				</AnimatePresence>
			</div>

			<AnimatePresence initial={false}>
				{selected && !typed ? (
					<motion.div
						key={selected.id}
						className="overflow-hidden"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.24, ease: EASE }}
					>
						<div className="pt-3">
							<div className="mb-3 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2">
									<TimeAgo workout={selected} editable={true} />
									<span className="text-slate-600">·</span>
									<EditValue workout={selected} />
								</div>
								<DeleteWorkout workout={selected} />
							</div>
							<Comment workout={selected} />
							{reference ? (
								<div className="mt-2 text-xs text-slate-500">
									{formatTimeAgo(reference.date)}: {reference.value}
								</div>
							) : null}
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
