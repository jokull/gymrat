import { createServerFn } from "@tanstack/react-start";
import { getCookie, getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDrizzle } from "~/db/client";
import { getWorkouts } from "~/db/queries";
import { workout } from "~/schema";
import { getNumberValue } from "~/utils/workouts";

import { authMiddleware } from "./auth";
import { getSessionUser, sealCsvToken, SESSION_COOKIE } from "./session";

export const $getWorkouts = createServerFn({ method: "GET" }).handler(async () => {
	const dbUser = await getSessionUser(getCookie(SESSION_COOKIE));
	if (!dbUser) return [];
	return getWorkouts({ dbUser, db: getDrizzle() });
});

/**
 * A ready-to-paste prompt for an AI agent: explains the data and includes
 * a signed 24-hour link to the CSV export that works without a session.
 */
export const $getClaudePrompt = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const token = await sealCsvToken(context.user.id);
		const origin = new URL(getRequest().url).origin;
		const url = `${origin}/workouts.csv?token=${encodeURIComponent(token)}`;

		return `Below is a signed link to my complete workout log from Gymrat, a simple workout tracker. Fetch it with a plain HTTP GET — no auth needed. The link expires 24 hours after it was issued and grants read access to my data, so treat it as a secret.

${url}

It returns CSV, one row per logged workout, newest first:

- id: entry id
- numberValue: \`value\` normalized for comparison — total seconds when the value is a time, otherwise its leading number (weight, reps, rounds, …)
- date: local timestamp, YYYY-MM-DD HH:MM:SS
- description: the workout name as I typed it; rows with the same description are the same exercise tracked over time
- isTopScore: true if the row is my current personal best for that description (lower is better for times, higher is better for everything else)
- value: the raw logged value as I typed it (e.g. "105 kg", "23m38s", "12 rounds")
- comment: an optional note I attached to the entry

Fetch the CSV before answering questions about my training.`;
	});

export const $createWorkout = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			description: z.string().min(1),
			value: z.string(),
		}),
	)
	.handler(async ({ data, context }) => {
		const { value: numberValue, isTime } = getNumberValue(data.value);

		const db = getDrizzle();
		await db
			.insert(workout)
			.values({
				userId: context.user.id,
				date: new Date(),
				id: crypto.randomUUID(),
				numberValue,
				value: data.value,
				isTime,
				description: data.description,
			})
			.run();

		return { ok: true as const };
	});

export const $deleteWorkout = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data, context }) => {
		const db = getDrizzle();
		await db
			.delete(workout)
			.where(and(eq(workout.userId, context.user.id), eq(workout.id, data.id)))
			.run();

		return { ok: true as const };
	});

export const $updateWorkout = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			id: z.string(),
			date: z.coerce.date().nullable().optional(),
			comment: z.string().optional(),
			value: z.string().min(1).optional(),
		}),
	)
	.handler(async ({ data, context }) => {
		const { id, date, comment, value } = data;
		const numberValue = typeof value === "string" ? getNumberValue(value) : undefined;

		const values = {
			...(date ? { date } : undefined),
			...(typeof comment === "string" ? { comment: comment.trim() || null } : undefined),
			...(numberValue
				? { value, numberValue: numberValue.value, isTime: numberValue.isTime }
				: undefined),
		} as const;

		if (date || typeof comment === "string" || numberValue) {
			const db = getDrizzle();
			await db
				.update(workout)
				.set(values)
				.where(and(eq(workout.userId, context.user.id), eq(workout.id, id)))
				.run();
		}

		return { ok: true as const };
	});
