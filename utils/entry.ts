import { getNumberValue } from "./workouts";

const lower = (text: string) => text.toLocaleLowerCase().trim();

export interface Entry {
	/** The part of the sentence that names the workout. */
	description: string;
	/** The part that is the score: "105 kg", "4:32". */
	value: string;
	/** The logged workout the sentence starts with, as it was first written. */
	known: string | null;
}

/**
 * Splits a sentence like "back squat 3x 105 kg" into the workout and its score.
 * Names can hold numbers of their own ("500 m row", "Deadlift 5x"), so workouts
 * that were logged before are read first and the guess only covers new ones.
 */
export function splitEntry(text: string, known: readonly string[]): Entry {
	const sentence = text.trim().replace(/\s+/g, " ");
	const typed = sentence.toLocaleLowerCase();

	let match: string | null = null;
	for (const description of known) {
		const name = lower(description);
		if (name === "" || (typed !== name && !typed.startsWith(`${name} `))) continue;
		if (!match || name.length > lower(match).length) match = description;
	}
	if (match) {
		return {
			description: match,
			value: sentence.slice(lower(match).length).trim(),
			known: match,
		};
	}

	// Still spelling out a logged workout: "back squat 3" is not a score of 3 yet.
	if (known.some((description) => lower(description).startsWith(typed))) {
		return { description: sentence, value: "", known: null };
	}

	const tokens = sentence.split(" ").filter(Boolean);
	let start = tokens.length - 1;
	// A unit can trail the number: "105 kg"
	if (start >= 1 && /^\p{L}+$/u.test(tokens[start]!) && /^\d/.test(tokens[start - 1]!)) {
		start -= 1;
	}
	if (start >= 1 && /^\d/.test(tokens[start]!)) {
		return {
			description: tokens.slice(0, start).join(" "),
			value: tokens.slice(start).join(" "),
			known: null,
		};
	}
	return { description: sentence, value: "", known: null };
}

/** Whether another logged workout continues this one: "Deadlift" and "Deadlift 5x". */
export function isAmbiguous(description: string, known: readonly string[]) {
	const name = lower(description);
	return known.some((other) => lower(other).startsWith(`${name} `));
}

const SUFFIX = /^\d+(?:[.,]\d+)?(\s*)(\p{L}+)$/u;
const BARE = /^\d+(?:[.,]\d+)?$/;

/** The unit a score was written with, spacing included: " kg" from "105 kg". */
export function getUnitSuffix(value: string) {
	if (getNumberValue(value).isTime) return null;
	const match = value.trim().match(SUFFIX);
	return match ? `${match[1]}${match[2]}` : null;
}

/** A number with no unit, which can take on the unit the workout is usually logged in. */
export function isBareNumber(value: string) {
	return BARE.test(value.trim());
}

export function formatScore(numberValue: number, isTime: boolean) {
	if (!isTime) return String(numberValue);
	const hours = Math.floor(numberValue / 3600);
	const minutes = Math.floor((numberValue % 3600) / 60);
	const seconds = String(numberValue % 60).padStart(2, "0");
	return hours > 0
		? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
		: `${minutes}:${seconds}`;
}

export interface Standing {
	isTime: boolean;
	/** The score to beat: the lowest time, or the highest weight or reps. */
	best: number;
	isPR: boolean;
	/** How far the score is from the best, always positive. */
	gap: number;
	/** 0 to 1: how close the score is to the best. */
	progress: number;
}

/** Where a score stands against the workout's history, or null when there is nothing to compare. */
export function getStanding(
	numberValue: number,
	isTime: boolean,
	history: readonly { numberValue: number; isTime: boolean }[],
): Standing | null {
	const scores = history
		.filter((entry) => entry.isTime === isTime && entry.numberValue > 0)
		.map((entry) => entry.numberValue);
	if (numberValue <= 0 || scores.length === 0) return null;
	const best = isTime ? Math.min(...scores) : Math.max(...scores);
	const isPR = isTime ? numberValue < best : numberValue > best;
	const progress = isTime ? best / numberValue : numberValue / best;
	return {
		isTime,
		best,
		isPR,
		gap: Math.abs(numberValue - best),
		progress: Math.min(1, Math.max(0, progress)),
	};
}
