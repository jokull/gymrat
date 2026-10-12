import { subDays } from "date-fns";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Dock, type DockHandle, type Match } from "~/src/components/dashboard/workout-dock";
import { WorkoutRow } from "~/src/components/dashboard/workouts";
import type { QueryWorkout } from "~/db/queries";
import { getNumberValue } from "~/utils/workouts";

type Logged = Pick<QueryWorkout, "id" | "description" | "value" | "date">;

/** Fills in what the database works out: the score and the best one per workout. */
function withScores(logged: Logged[]): QueryWorkout[] {
	const rows = logged.map((row) => {
		const { value: numberValue, isTime } = getNumberValue(row.value);
		return { ...row, comment: null, numberValue, isTime };
	});
	return rows.map((row) => {
		const scores = rows
			.filter((other) => other.description === row.description)
			.map((other) => other.numberValue);
		return { ...row, minScore: Math.min(...scores), maxScore: Math.max(...scores) };
	});
}

function getHistory(): Logged[] {
	const today = new Date();
	return [
		{ id: "squat-2", description: "Back Squat 3x", value: "105 kg", date: subDays(today, 3) },
		{ id: "pull-2", description: "Pull-ups", value: "12", date: subDays(today, 5) },
		{ id: "fran-2", description: "Fran", value: "4:32", date: subDays(today, 6) },
		{ id: "squat-1", description: "Back Squat 3x", value: "100 kg", date: subDays(today, 8) },
		{ id: "pull-1", description: "Pull-ups", value: "10", date: subDays(today, 12) },
		{ id: "fran-1", description: "Fran", value: "4:51", date: subDays(today, 20) },
	];
}

const sleep = async (ms: number) =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});

/** Stands in for the model: it knows the one shorthand the teaser types. */
const guess: Match = async (text) => {
	await sleep(700);
	return text.startsWith("chin") ? { match: "Pull-ups", confidence: 0.87 } : null;
};

/** The dock playing itself on a loop: three workouts logged, three bests beaten. */
export function Teaser() {
	const [logged, setLogged] = useState(getHistory);
	// A new run gets a new dock, so nothing typed in the last one is left over.
	const [run, setRun] = useState(0);
	const [visible, setVisible] = useState(false);
	const frame = useRef<HTMLElement>(null);
	const dock = useRef<DockHandle>(null);
	const reduce = useReducedMotion();

	// It only plays while it's on screen.
	useEffect(() => {
		if (!frame.current) return;
		const watch = new IntersectionObserver(([entry]) => {
			setVisible(entry?.isIntersecting ?? false);
		});
		watch.observe(frame.current);
		return () => {
			watch.disconnect();
		};
	}, []);

	useEffect(() => {
		if (reduce || !visible) return;
		let playing = true;
		const pause = async (ms: number) => {
			await sleep(ms);
			if (!playing || document.hidden) throw new Error("stopped");
		};
		const type = async (sentence: string) => {
			for (const char of sentence) {
				dock.current?.type(char);
				await pause(95);
			}
		};
		const enter = async (after: number) => {
			dock.current?.enter();
			await pause(after);
		};
		const play = async () => {
			while (playing) {
				setLogged(getHistory());
				setRun((n) => n + 1);
				await pause(1400);

				// a few letters are enough to find the workout
				await type("sq");
				await pause(900);
				await enter(1000);
				await type("110");
				await pause(1500);
				await enter(2000);

				// shorthand the words can't settle goes to the model
				await type("chinups");
				await pause(1800);
				await enter(900);
				await type("14");
				await pause(1500);
				await enter(2000);

				// a workout typed out in full locks itself in, and a faster time is a PR too
				await type("fran 4:10");
				await pause(1700);
				await enter(2600);
			}
		};
		play().catch(() => undefined);
		return () => {
			playing = false;
		};
	}, [reduce, visible]);

	const workouts = withScores(logged);

	return (
		<figure
			ref={frame}
			className="relative mx-auto h-[540px] w-full max-w-sm overflow-hidden rounded-[36px] border border-white/10 bg-[rgb(5,1,13)]"
		>
			<figcaption className="sr-only">
				Gymrat logging three workouts, each typed as one line and each a personal best
			</figcaption>
			<div inert className="flex h-full flex-col justify-between">
				<div className="flex flex-col gap-1 px-2 pt-4">
					<AnimatePresence initial={false} mode="popLayout">
						{workouts.map((workout) => (
							<motion.div
								key={workout.id}
								layout
								data-workout="false"
								className="group rounded-md p-2 text-slate-400"
								initial={{ opacity: 0, transform: "translateY(-12px)" }}
								animate={{ opacity: 1, transform: "translateY(0px)" }}
								exit={{ opacity: 0 }}
								transition={{ type: "spring", duration: 0.4, bounce: 0 }}
							>
								<WorkoutRow active={false} checked={false} workout={workout} />
							</motion.div>
						))}
					</AnimatePresence>
				</div>
				<div className="absolute inset-x-0 bottom-0">
					<Dock
						key={run}
						ref={dock}
						docked={false}
						workouts={workouts}
						selected={null}
						onSelect={() => undefined}
						onSave={(input, { onSettled }) => {
							setLogged((rows) => [
								{ id: `new-${rows.length}`, date: new Date(), ...input },
								...rows,
							]);
							onSettled();
						}}
						match={guess}
					/>
				</div>
			</div>
		</figure>
	);
}
