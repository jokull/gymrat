import {
	ArrowUturnLeftIcon,
	CheckIcon,
	LockClosedIcon,
	PlusIcon,
	SparklesIcon,
	XMarkIcon,
} from "@heroicons/react/20/solid";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Fuse from "fuse.js";
import {
	type ReactNode,
	type Ref,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";

import type { QueryWorkout } from "~/db/queries";
import { useCreateWorkout } from "~/lib/use-workouts";
import { $matchWorkout } from "~/src/lib/workouts";
import { cn } from "~/utils/classnames";
import { getStanding, isAmbiguous, splitEntry } from "~/utils/entry";
import { useKeyboardInset } from "~/utils/use-keyboard-inset";
import { getNumberValue } from "~/utils/workouts";

import { DockCard, EASE, getArmableSuffix, type Lift } from "./dock-card";

const lower = (text: string) => text.toLocaleLowerCase().trim();

function getLifts(workouts: QueryWorkout[]) {
	const lifts = new Map<string, Lift>();
	// workouts come newest first, so lifts do too
	for (const workout of workouts) {
		const id = lower(workout.description);
		const lift = lifts.get(id);
		if (lift) lift.entries.push(workout);
		else lifts.set(id, { description: workout.description, entries: [workout] });
	}
	return lifts;
}

/** One icon or label giving way to another: from small and blurred, a spring with no bounce. */
const SWAP = {
	initial: { opacity: 0, transform: "scale(0.9)", filter: "blur(4px)" },
	animate: { opacity: 1, transform: "scale(1)", filter: "blur(0px)" },
	exit: { opacity: 0, transform: "scale(0.9)", filter: "blur(4px)" },
	transition: { type: "spring", duration: 0.25, bounce: 0 },
} as const;

type Candidate =
	| { kind: "lift"; id: string; lift: Lift; guessed?: number }
	| { kind: "new"; id: string; description: string };

/** Asks which logged workout a shorthand means. Null when there is no answer. */
export type Match = (
	text: string,
	options: readonly string[],
	signal: AbortSignal,
) => Promise<{ match: string | null; confidence: number } | null>;

/** Drives the dock from code, the way a keyboard would. */
export interface DockHandle {
	type: (chars: string) => void;
	enter: () => void;
}

interface Guess {
	query: string;
	match: string | null;
	confidence: number;
}

/**
 * Asks the decision model which logged workout a shorthand means ("dl" for "Deadlift 5x"),
 * once typing pauses and only when the words alone didn't settle it.
 */
function useGuess(query: string, options: readonly string[], enabled: boolean, ask: Match) {
	const [guess, setGuess] = useState<Guess | null>(null);
	const answered = useRef(new Map<string, Guess>());

	useEffect(() => {
		if (!enabled) return;
		const cached = answered.current.get(query);
		if (cached) {
			setGuess(cached);
			return;
		}
		const asked = new AbortController();
		const wait = setTimeout(() => {
			ask(query, options, asked.signal)
				.then((data) => {
					if (!data) return;
					const heard = { query, ...data };
					answered.current.set(query, heard);
					setGuess(heard);
				})
				// no answer, or no model to ask right now: the words decide
				.catch(() => undefined);
		}, 280);
		return () => {
			clearTimeout(wait);
			asked.abort();
		};
	}, [enabled, query, options, ask]);

	const current = guess && guess.query === query ? guess : null;
	return { guess: current, asking: enabled && current === null };
}

/** The empty field's line: the athlete's own workouts as examples, taking turns. */
function Cycle({ lines }: { lines: string[] }) {
	const [turn, setTurn] = useState(0);
	const several = lines.length > 1;
	useEffect(() => {
		if (!several) return;
		const next = setInterval(() => {
			if (!document.hidden) setTurn((t) => t + 1);
		}, 3200);
		return () => {
			clearInterval(next);
		};
	}, [several]);
	const line = lines[turn % lines.length];
	return (
		<span
			aria-hidden
			className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-slate-500"
		>
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					key={line}
					className="min-w-0 truncate"
					initial={{ opacity: 0, transform: "translateY(8px)", filter: "blur(4px)" }}
					animate={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
					exit={{ opacity: 0, transform: "translateY(-8px)", filter: "blur(4px)" }}
					transition={{ duration: 0.25, ease: EASE }}
				>
					{line}
				</motion.span>
			</AnimatePresence>
		</span>
	);
}

function Chip({
	candidate,
	active,
	onPick,
	onHover,
}: {
	candidate: Candidate;
	active: boolean;
	onPick: () => void;
	onHover: () => void;
}) {
	const last = candidate.kind === "lift" ? candidate.lift.entries[0] : undefined;
	return (
		<motion.button
			type="button"
			aria-current={active}
			layoutId={candidate.id}
			// the field keeps the focus, so the keyboard stays up after a press
			onMouseDown={(event) => {
				event.preventDefault();
			}}
			onMouseEnter={onHover}
			onClick={onPick}
			transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
			className={cn(
				"flex h-9 max-w-full shrink-0 items-center gap-1.5 rounded-[12px] px-3 text-sm select-none",
				"transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.97]",
				active ? "bg-white/15 text-white" : "bg-white/5 text-slate-300",
			)}
		>
			{candidate.kind === "new" ? (
				<PlusIcon className="h-4 w-4 text-teal-400" />
			) : candidate.guessed !== undefined ? (
				<SparklesIcon className="h-4 w-4 text-pink-400" />
			) : null}
			<span className="truncate font-medium">
				{candidate.kind === "new" ? candidate.description : candidate.lift.description}
			</span>
			{candidate.kind === "new" ? (
				<span className="text-slate-500">new</span>
			) : candidate.guessed !== undefined ? (
				<span className="text-pink-400/80 tabular-nums">
					{Math.round(candidate.guessed * 100)}%
				</span>
			) : last ? (
				<span className="text-slate-500">{last.value}</span>
			) : null}
		</motion.button>
	);
}

function Rail({ label, children }: { label: ReactNode; children: ReactNode }) {
	return (
		<div className="p-3">
			<div className="mb-2 flex h-4 items-center gap-1.5 px-1 text-xs font-medium text-slate-500">
				{label}
			</div>
			<div className="flex flex-wrap gap-1.5">{children}</div>
		</div>
	);
}

const askModel: Match = async (text, options, signal) =>
	$matchWorkout({ data: { text, options: [...options] }, signal });

export function WorkoutDock({
	workouts,
	selected,
	onSelect,
}: {
	workouts: QueryWorkout[];
	selected: QueryWorkout | null;
	onSelect: (workout: QueryWorkout | null) => void;
}) {
	const mutation = useCreateWorkout();
	return (
		<Dock
			workouts={workouts}
			selected={selected}
			onSelect={onSelect}
			onSave={mutation.mutate}
			pending={mutation.isPending}
			error={mutation.error?.message}
			match={askModel}
		/>
	);
}

/** The dock without its data: what it saves to and who it asks are handed in. */
export function Dock({
	workouts,
	selected,
	onSelect,
	onSave,
	pending = false,
	error,
	match,
	docked = true,
	ref,
}: {
	workouts: QueryWorkout[];
	selected: QueryWorkout | null;
	onSelect: (workout: QueryWorkout | null) => void;
	onSave: (
		input: { description: string; value: string },
		callbacks: { onError: () => void; onSettled: () => void },
	) => void;
	pending?: boolean;
	error?: string;
	match: Match;
	/** Pinned to the foot of the screen. Off, it sits where it's put. */
	docked?: boolean;
	ref?: Ref<DockHandle>;
}) {
	const [text, setText] = useState("");
	const [locked, setLocked] = useState<string | null>(selected?.description ?? null);
	const [armed, setArmed] = useState(true);
	const [focused, setFocused] = useState(false);
	const [saved, setSaved] = useState(false);
	const input = useRef<HTMLInputElement>(null);
	const dock = useRef<HTMLDivElement>(null);
	useKeyboardInset(dock, docked);

	const lifts = useMemo(() => getLifts(workouts), [workouts]);
	const known = useMemo(() => [...lifts.values()].map((lift) => lift.description), [lifts]);
	const fuse = useMemo(
		() =>
			new Fuse([...lifts.values()], {
				keys: ["description"],
				includeScore: true,
				ignoreLocation: true,
				threshold: 0.4,
			}),
		[lifts],
	);

	// Picking a row locks its workout in; putting the row away lets it go.
	const [selectedId, setSelectedId] = useState(selected?.id ?? null);
	if ((selected?.id ?? null) !== selectedId) {
		setSelectedId(selected?.id ?? null);
		setLocked(selected?.description ?? null);
		setArmed(true);
		if (selected) setText("");
	}

	const entry = locked
		? { description: locked, value: text.trim(), known: locked }
		: splitEntry(text, known);
	const query = locked ? "" : entry.description;
	const lockedLift = locked ? (lifts.get(lower(locked)) ?? null) : null;

	// The words settle it when the sentence starts with a logged workout or sits close to one.
	const hits = useMemo(() => (query ? fuse.search(query).slice(0, 4) : []), [fuse, query]);
	const settled = entry.known !== null || (hits[0]?.score ?? 1) < 0.2;
	const { guess, asking } = useGuess(
		query,
		known,
		!locked && !settled && query.length >= 2 && known.length > 0,
		match,
	);

	const candidates = useMemo(() => {
		const list: Candidate[] = [];
		const add = (lift: Lift | undefined, guessed?: number) => {
			const id = lift ? `lift-${lower(lift.description)}` : "";
			if (lift && !list.some((candidate) => candidate.id === id)) {
				list.push({ kind: "lift", id, lift, guessed });
			}
		};
		if (!query) {
			for (const lift of [...lifts.values()].slice(0, 6)) add(lift);
			return list;
		}
		if (entry.known) add(lifts.get(lower(entry.known)));
		if (guess?.match) add(lifts.get(lower(guess.match)), guess.confidence);
		for (const hit of hits) add(hit.item);
		if (!lifts.has(lower(query))) {
			list.push({ kind: "new", id: `lift-${lower(query)}`, description: query });
		}
		return list;
	}, [query, entry.known, guess, hits, lifts]);

	// The highlighted chip, remembered only for the words it was chosen in.
	const [cursor, setCursor] = useState<{ query: string; index: number } | null>(null);
	const active =
		cursor && cursor.query === query ? Math.min(cursor.index, candidates.length - 1) : 0;

	const suffix = locked ? getArmableSuffix(text, lockedLift) : null;
	const value = suffix !== null && armed ? `${text.trim()}${suffix}` : entry.value;
	const reading = getNumberValue(value);
	const isPR =
		getStanding(reading.value, reading.isTime, lockedLift?.entries ?? [])?.isPR ?? false;

	const lock = (description: string, rest = "") => {
		setLocked(description);
		setText(rest);
		setArmed(true);
		if ("vibrate" in navigator) navigator.vibrate(8);
	};
	const unlock = () => {
		setLocked(null);
		if (selected) onSelect(null);
	};
	const save = (description: string) => {
		if (description.trim() === "" || value.trim() === "" || pending) return;
		// The row is in the list before the server answers, so the field lets go of it right away
		// and takes it back if the save fails.
		const typed = locked ? text : entry.value;
		setText("");
		if (!selected) setLocked(null);
		setSaved(true);
		onSave(
			{ description, value },
			{
				onError: () => {
					setLocked(description);
					setText(typed);
					setSaved(false);
				},
				onSettled: () => {
					setTimeout(() => {
						setSaved(false);
					}, 1200);
				},
			},
		);
	};
	const pick = (candidate: Candidate) => {
		lock(
			candidate.kind === "lift" ? candidate.lift.description : candidate.description,
			entry.value,
		);
		input.current?.focus();
	};

	const top = locked ? undefined : candidates[active];
	// Enter locks a logged workout in before it saves one, so a typo never becomes a new workout unasked.
	const enter: "lock" | "save" | null = locked
		? value.trim()
			? "save"
			: null
		: !query
			? null
			: top?.kind === "lift" || !entry.value
				? "lock"
				: "save";
	const onEnter = () => {
		if (enter === "save") save(locked ?? entry.description);
		else if (enter === "lock" && top) pick(top);
	};
	const change = (next: string) => {
		if (locked) {
			setText(next);
			return;
		}
		// A logged workout typed out in full locks itself in, unless another one continues it.
		const read = splitEntry(next, known);
		if (read.known && !isAmbiguous(read.known, known) && (read.value || /\s$/.test(next))) {
			lock(read.known, read.value);
		} else {
			setText(next);
		}
	};
	useImperativeHandle(ref, () => ({
		type: (chars) => {
			change(text + chars);
		},
		enter: onEnter,
	}));

	const view = locked
		? "card"
		: query
			? "match"
			: // after a save the dock rests, field still focused, until it's typed in again
				focused && !saved && candidates.length > 0
				? "recent"
				: null;

	// Whatever opens above the field sits in one box, and only that box's height animates.
	const [box, setBox] = useState<HTMLDivElement | null>(null);
	const [height, setHeight] = useState(0);
	useEffect(() => {
		if (!box) return;
		const measure = new ResizeObserver(() => {
			setHeight(box.offsetHeight);
		});
		measure.observe(box);
		return () => {
			measure.disconnect();
		};
	}, [box]);

	const examples = useMemo(
		() =>
			[...lifts.values()]
				.slice(0, 3)
				.map(
					(lift) =>
						`Try “${lift.description.toLocaleLowerCase()} ${lift.entries[0]?.value}”`,
				),
		[lifts],
	);
	const placeholder = locked
		? (lockedLift?.entries[0]?.value ?? "Score")
		: examples.length > 0
			? undefined
			: "Try “deadlift 100 kg”";

	const chips = candidates.map((candidate, index) => (
		<Chip
			key={candidate.id}
			candidate={candidate}
			active={view === "match" && index === active}
			onPick={() => {
				pick(candidate);
			}}
			onHover={() => {
				setCursor({ query, index });
			}}
		/>
	));

	return (
		<MotionConfig reducedMotion="user">
			<div
				ref={dock}
				className={cn(
					"pointer-events-none px-3 pt-8",
					docked
						? "fixed inset-x-0 bottom-0 z-50 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] will-change-transform"
						: "relative pb-3",
				)}
			>
				{/* the list fades out under the dock instead of being cut by it */}
				<div
					aria-hidden
					className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(5,1,13)] from-40% to-transparent"
				/>
				<div className="pointer-events-auto mx-auto max-w-lg overflow-hidden rounded-[22px] bg-slate-800/70 text-white shadow-[0_8px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10 backdrop-blur-xl">
					<motion.div
						initial={false}
						animate={{ height }}
						transition={{ duration: 0.26, ease: EASE }}
						className="overflow-hidden"
					>
						<div ref={setBox} className="relative">
							<AnimatePresence initial={false} mode="popLayout">
								{view === "card" ? (
									<motion.div
										key="card"
										initial={{ opacity: 0 }}
										animate={{
											opacity: 1,
											transition: { duration: 0.2, ease: EASE },
										}}
										exit={{
											opacity: 0,
											transition: { duration: 0.12, ease: EASE },
										}}
									>
										<DockCard
											lift={lockedLift}
											value={text}
											armed={armed}
											onToggleArmed={() => {
												setArmed((on) => !on);
											}}
											selected={selected}
										/>
										{error ? (
											<p className="px-4 pb-3 text-sm text-red-400">
												{error}
											</p>
										) : null}
										<div aria-hidden className="mx-3 h-px bg-white/10" />
									</motion.div>
								) : view ? (
									<motion.div
										key="rail"
										initial={{ opacity: 0 }}
										animate={{
											opacity: 1,
											transition: { duration: 0.18, ease: EASE },
										}}
										exit={{
											opacity: 0,
											transition: { duration: 0.12, ease: EASE },
										}}
									>
										<Rail
											label={
												view === "recent" ? (
													"Recent"
												) : asking ? (
													<>
														<SparklesIcon className="h-3.5 w-3.5 animate-pulse text-pink-400" />
														Matching
													</>
												) : top?.kind === "lift" ? (
													"Lock it in"
												) : (
													"New workout"
												)
											}
										>
											{chips}
										</Rail>
										<div aria-hidden className="mx-3 h-px bg-white/10" />
									</motion.div>
								) : null}
							</AnimatePresence>
						</div>
					</motion.div>

					<form
						className="flex h-14 items-center gap-2 pr-2 pl-2"
						onSubmit={(event) => {
							event.preventDefault();
							onEnter();
						}}
					>
						<AnimatePresence initial={false} mode="popLayout">
							{locked ? (
								<motion.button
									key={`lift-${lower(locked)}`}
									layoutId={`lift-${lower(locked)}`}
									type="button"
									aria-label={`${locked}, locked in. Press to change.`}
									onMouseDown={(event) => {
										event.preventDefault();
									}}
									onClick={() => {
										unlock();
										input.current?.focus();
									}}
									exit={{ opacity: 0, transform: "scale(0.9)" }}
									transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
									className={cn(
										"group relative flex h-10 max-w-[55%] shrink-0 items-center gap-1.5 rounded-[14px] pr-3 pl-2.5 text-sm font-semibold select-none",
										"transition-[scale] duration-150 ease-out active:scale-[0.97]",
										lockedLift
											? "bg-white text-slate-900"
											: "bg-teal-400 text-slate-900",
									)}
								>
									{/* the latch: a ring that closes on the chip as it lands */}
									<motion.span
										aria-hidden
										className="absolute inset-0 rounded-[14px] ring-2 ring-pink-400"
										initial={{ opacity: 0.9, transform: "scale(1.18)" }}
										animate={{ opacity: 0, transform: "scale(1)" }}
										transition={{ duration: 0.3, ease: EASE, delay: 0.08 }}
									/>
									<motion.span
										className="relative flex h-4 w-4 items-center justify-center"
										initial={{ transform: "scale(0.8) rotate(-20deg)" }}
										animate={{ transform: "scale(1) rotate(0deg)" }}
										transition={{
											type: "spring",
											duration: 0.35,
											bounce: 0.2,
											delay: 0.08,
										}}
									>
										{lockedLift ? (
											<>
												<LockClosedIcon className="h-4 w-4 transition-opacity duration-150 group-hover:opacity-0" />
												<XMarkIcon className="absolute h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
											</>
										) : (
											<PlusIcon className="h-4 w-4" />
										)}
									</motion.span>
									<span className="truncate">{locked}</span>
								</motion.button>
							) : null}
						</AnimatePresence>
						<span className="relative h-full min-w-0 flex-1">
							{!text && !placeholder ? <Cycle lines={examples} /> : null}
							<input
								ref={input}
								value={text}
								onChange={(event) => {
									change(event.target.value);
								}}
								onFocus={() => {
									setFocused(true);
								}}
								onBlur={() => {
									setFocused(false);
								}}
								onKeyDown={(event) => {
									if (event.nativeEvent.isComposing) return;
									if (event.key === "Escape" && (locked || text)) {
										event.stopPropagation();
										if (text) setText("");
										else unlock();
									} else if (locked && event.key === "Backspace" && text === "") {
										event.preventDefault();
										unlock();
									} else if (
										view &&
										view !== "card" &&
										event.key === "ArrowDown"
									) {
										event.preventDefault();
										setCursor({
											query,
											index: Math.min(candidates.length - 1, active + 1),
										});
									} else if (view && view !== "card" && event.key === "ArrowUp") {
										event.preventDefault();
										setCursor({ query, index: Math.max(0, active - 1) });
									} else if (view === "match" && event.key === "Tab" && top) {
										event.preventDefault();
										pick(top);
									}
								}}
								aria-label={locked ? `Score for ${locked}` : "Log a workout"}
								placeholder={placeholder}
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="none"
								spellCheck={false}
								enterKeyHint={enter === "save" ? "done" : "next"}
								// 16px, so iOS doesn't zoom the page when the field is focused
								className="relative size-full bg-transparent px-2 text-[16px] outline-none placeholder:text-slate-500"
							/>
						</span>
						<AnimatePresence initial={false} mode="popLayout">
							{saved ? (
								<motion.span
									key="saved"
									{...SWAP}
									className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-teal-500/20 text-teal-400"
								>
									<CheckIcon className="h-5 w-5" />
								</motion.span>
							) : enter ? (
								<motion.button
									key={enter === "lock" ? "lock" : isPR ? "save-pr" : "save"}
									type="submit"
									onMouseDown={(event) => {
										event.preventDefault();
									}}
									{...SWAP}
									disabled={pending}
									className={cn(
										"flex h-10 shrink-0 items-center gap-1.5 rounded-[14px] pr-2.5 pl-3.5 text-sm font-bold whitespace-nowrap select-none",
										"transition-[scale,opacity] duration-150 ease-out active:scale-[0.97] disabled:opacity-60",
										enter === "lock"
											? "bg-white/15 text-white"
											: isPR
												? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/30"
												: "bg-pink-500 text-white shadow-lg shadow-pink-500/40",
									)}
								>
									{enter === "lock" ? "Lock" : isPR ? "Save PR" : "Save"}
									<ArrowUturnLeftIcon className="h-3.5 w-3.5 -scale-y-100 opacity-60" />
								</motion.button>
							) : null}
						</AnimatePresence>
					</form>
				</div>
			</div>
		</MotionConfig>
	);
}
