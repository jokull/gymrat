import { describe, expect, it } from "vitest";

import {
	formatScore,
	getStanding,
	getUnitSuffix,
	isAmbiguous,
	isBareNumber,
	splitEntry,
} from "./entry";

const known = ["Deadlift 5x", "Back Squat 3x", "500 m row", "Deadlift"];

describe("splitEntry", () => {
	it("reads a logged workout first, in the case it was written in", () => {
		expect(splitEntry("back squat 3x 105 kg", known)).toEqual({
			description: "Back Squat 3x",
			value: "105 kg",
			known: "Back Squat 3x",
		});
		expect(splitEntry("500 m row 2:30 min", known)).toEqual({
			description: "500 m row",
			value: "2:30 min",
			known: "500 m row",
		});
	});

	it("prefers the longest logged workout the sentence starts with", () => {
		expect(splitEntry("deadlift 5x 140", known).known).toBe("Deadlift 5x");
		expect(splitEntry("deadlift 140", known)).toMatchObject({
			known: "Deadlift",
			value: "140",
		});
	});

	it("holds the score back while a logged workout is being spelled out", () => {
		expect(splitEntry("back squat 3", known)).toEqual({
			description: "back squat 3",
			value: "",
			known: null,
		});
	});

	it("guesses the score of a new workout from the end of the sentence", () => {
		expect(splitEntry("fran 4:32", [])).toMatchObject({ description: "fran", value: "4:32" });
		expect(splitEntry("5k run 20m38s", [])).toMatchObject({
			description: "5k run",
			value: "20m38s",
		});
		expect(splitEntry("bench 5x 80 kg", [])).toMatchObject({
			description: "bench 5x",
			value: "80 kg",
		});
		expect(splitEntry("1000 m ski", [])).toMatchObject({
			description: "1000 m ski",
			value: "",
		});
		expect(splitEntry("140", [])).toMatchObject({ description: "140", value: "" });
	});
});

describe("isAmbiguous", () => {
	it("is true when another workout continues the name", () => {
		expect(isAmbiguous("Deadlift", known)).toBe(true);
		expect(isAmbiguous("Deadlift 5x", known)).toBe(false);
	});
});

describe("units", () => {
	it("reads the unit a score was written with", () => {
		expect(getUnitSuffix("105 kg")).toBe(" kg");
		expect(getUnitSuffix("105kg")).toBe("kg");
		expect(getUnitSuffix("105")).toBeNull();
		expect(getUnitSuffix("2:30 min")).toBeNull();
		expect(getUnitSuffix("20m38s")).toBeNull();
	});

	it("knows a number that has no unit", () => {
		expect(isBareNumber("105")).toBe(true);
		expect(isBareNumber("102.5")).toBe(true);
		expect(isBareNumber("105 kg")).toBe(false);
		expect(isBareNumber("4:32")).toBe(false);
	});
});

describe("formatScore", () => {
	it("writes seconds as a time", () => {
		expect(formatScore(150, true)).toBe("2:30");
		expect(formatScore(3725, true)).toBe("1:02:05");
		expect(formatScore(105, false)).toBe("105");
	});
});

describe("getStanding", () => {
	const lifts = [
		{ numberValue: 100, isTime: false },
		{ numberValue: 105, isTime: false },
	];
	const rows = [
		{ numberValue: 150, isTime: true },
		{ numberValue: 141, isTime: true },
	];

	it("calls a heavier lift a PR", () => {
		expect(getStanding(110, false, lifts)).toMatchObject({ best: 105, isPR: true, gap: 5 });
		expect(getStanding(105, false, lifts)).toMatchObject({ isPR: false, gap: 0, progress: 1 });
		expect(getStanding(84, false, lifts)).toMatchObject({ isPR: false, progress: 0.8 });
	});

	it("calls a faster time a PR", () => {
		expect(getStanding(139, true, rows)).toMatchObject({ best: 141, isPR: true, gap: 2 });
		expect(getStanding(160, true, rows)).toMatchObject({ isPR: false, gap: 19 });
	});

	it("has nothing to say without comparable history", () => {
		expect(getStanding(110, false, [])).toBeNull();
		expect(getStanding(110, false, rows)).toBeNull();
		expect(getStanding(0, false, lifts)).toBeNull();
	});
});
