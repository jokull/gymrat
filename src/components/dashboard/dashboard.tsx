import { useCallback, useEffect, useState } from "react";

import type { QueryWorkout } from "~/db/queries";
import { useWorkouts } from "~/lib/use-workouts";

import { CopyForClaude } from "./copy-for-claude";
import { WorkoutDock } from "./workout-dock";
import { Workouts } from "./workouts";

function getHashId() {
	if (typeof window === "undefined") return null;
	const hash = window.location.hash.slice(1);
	return hash || null;
}

export function Dashboard({ apiKey }: { apiKey: string }) {
	const { data: workouts = [] } = useWorkouts();
	// Start with no selection to match the server-rendered HTML; the URL
	// hash is only readable in the browser, so apply it after mount
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const selected = workouts.find((w) => w.id === selectedId) ?? null;

	// Initial read after hydration, then sync on popstate (back/forward)
	useEffect(() => {
		setSelectedId(getHashId());
		const onHashChange = () => {
			setSelectedId(getHashId());
		};
		window.addEventListener("hashchange", onHashChange);
		return () => {
			window.removeEventListener("hashchange", onHashChange);
		};
	}, []);

	const onSelect = useCallback((workout: QueryWorkout | null) => {
		setSelectedId(workout?.id ?? null);
		if (workout) {
			window.history.replaceState(null, "", `#${workout.id}`);
		} else {
			window.history.replaceState(null, "", window.location.pathname);
		}
	}, []);

	return (
		<div className="flex h-full flex-col gap-4 pb-96">
			<div className="flex grow flex-col gap-8">
				<Workouts workouts={workouts} selected={selected} onSelect={onSelect} />
			</div>
			<footer className="text-center text-xs leading-5 text-slate-600">
				<p className="flex items-center justify-center gap-3 text-sm text-slate-400">
					<a className="underline" href="/workouts.csv">
						Download CSV
					</a>
					<CopyForClaude />
				</p>
				<p className="">{apiKey}</p>
			</footer>
			<WorkoutDock workouts={workouts} selected={selected} onSelect={onSelect} />
		</div>
	);
}
