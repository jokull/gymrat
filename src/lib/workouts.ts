import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDrizzle } from "~/db/client";
import { getWorkouts } from "~/db/queries";
import { workout } from "~/schema";
import { getNumberValue } from "~/utils/workouts";

import { authMiddleware } from "./auth";
import { getSessionUser, SESSION_COOKIE } from "./session";

export const $getWorkouts = createServerFn({ method: "GET" }).handler(async () => {
	const dbUser = await getSessionUser(getCookie(SESSION_COOKIE));
	if (!dbUser) return [];
	return getWorkouts({ dbUser, db: getDrizzle() });
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
