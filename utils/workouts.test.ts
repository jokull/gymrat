import { describe, expect, it } from "vitest";
import { getNumberValue, parseTime } from "./workouts";

describe("parseTime", () => {
	it("parses H:MM:SS", () => {
		expect(parseTime("1:02:03")).toBe(3723);
	});

	it("parses MM:SS", () => {
		expect(parseTime("2:30")).toBe(150);
	});

	it("parses shorthand combining hours, minutes and seconds", () => {
		expect(parseTime("20m38s")).toBe(1238);
		expect(parseTime("1h30m")).toBe(5400);
		expect(parseTime("1h45s")).toBe(3645);
	});

	it("parses shorthand with a single unit", () => {
		expect(parseTime("45s")).toBe(45);
		expect(parseTime("5m")).toBe(300);
	});

	it("parses word-based min/sec", () => {
		expect(parseTime("12 min")).toBe(720);
		expect(parseTime("5 sec")).toBe(5);
	});

	it("returns 0 for non-time input", () => {
		expect(parseTime("95")).toBe(0);
		expect(parseTime("95 kg")).toBe(0);
	});
});

describe("getNumberValue", () => {
	it("flags time strings as isTime", () => {
		expect(getNumberValue("20m38s")).toEqual({ value: 1238, isTime: true });
	});

	it("falls back to a plain number for non-time strings", () => {
		expect(getNumberValue("95 kg")).toEqual({ value: 95, isTime: false });
	});
});
