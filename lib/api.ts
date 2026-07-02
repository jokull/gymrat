import { zValidator as zv } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { sealData, unsealData } from "iron-session";
import type { ValidationTargets } from "hono";
import type { ZodSchema } from "zod";
import { WorkerMailer } from "worker-mailer";
import { z } from "zod";

import { getDrizzle } from "~/db/client";
import { hashPassword, normalizeEmail, verifyPassword } from "~/db/passwords";
import { user, workout } from "~/schema";
import { unsealVerificationToken } from "~/utils/auth";
import { getNumberValue } from "~/utils/workouts";

function zValidator<T extends keyof ValidationTargets, S extends ZodSchema>(target: T, schema: S) {
	return zv(target, schema, (result, c) => {
		if (!result.success) {
			return c.json({ error: result.error.issues.map((i) => i.message).join(", ") }, 400);
		}
	});
}

const sessionSchema = z.object({ email: z.string().email() });

async function getSessionUser(cookie: string | undefined) {
	if (!cookie) return null;
	const data = await unsealData(cookie, {
		password: process.env.SECRET_KEY,
	});
	const result = sessionSchema.safeParse(data);
	if (!result.success) return null;
	const db = getDrizzle();
	const dbUser = await db.query.user.findFirst({
		where: { email: result.data.email },
	});
	return dbUser ?? null;
}

function makeSessionCookie(value: string) {
	return `__session=${value}; Max-Age=2592000; Path=/; SameSite=Strict; Secure; HttpOnly`;
}

const api = new Hono().basePath("/api");

// Login
api.post(
	"/login",
	zValidator(
		"json",
		z.object({
			email: z.string().email(),
			password: z.string().min(6),
		}),
	),
	async (c) => {
		const form = c.req.valid("json");
		const email = normalizeEmail(form.email);
		const db = getDrizzle();
		const dbUser = await db.query.user.findFirst({ where: { email } });

		if (!dbUser) {
			return c.json({ error: "No user found" }, 400);
		}

		if (!verifyPassword(form.password, dbUser.hashedPassword)) {
			return c.json({ error: "This password is incorrect" }, 400);
		}

		const sealed = await sealData(
			{ email },
			{ password: process.env.SECRET_KEY, ttl: 60 * 60 * 24 * 365 },
		);

		c.header("Set-Cookie", makeSessionCookie(sealed));
		return c.json({ ok: true });
	},
);

// Signup (send verification email)
api.post("/signup", zValidator("json", z.object({ email: z.string().email() })), async (c) => {
	const form = c.req.valid("json");
	const email = normalizeEmail(form.email);

	const token = await sealData(email, {
		password: process.env.SECRET_KEY,
		ttl: 60 * 60,
	});

	const contentValue = `https://${process.env.HOST}/verify?token=${token}`;

	const mailer = await WorkerMailer.connect({
		credentials: {
			username: process.env.FASTMAIL_SMTP_USERNAME,
			password: process.env.FASTMAIL_SMTP_PASSWORD,
		},
		authType: "plain",
		host: "smtp.fastmail.com",
		port: 587,
		secure: true,
	});

	await mailer.send({
		from: { name: "Jökull Sólberg", email: "jokull@solberg.is" },
		to: { email },
		subject: "Verify email",
		text: contentValue,
		html: `<a href="${contentValue}">Verify email</a>`,
	});

	return c.json({
		message:
			"Signup email was sent just now - follow the link in it to verify and finish signup - don't forget to check spam!",
	});
});

// Set password (from verification link)
api.post(
	"/set-password",
	zValidator(
		"json",
		z.object({
			password: z.string().min(6),
			token: z.string(),
		}),
	),
	async (c) => {
		const form = c.req.valid("json");

		let email: string;
		try {
			email = await unsealVerificationToken(form.token);
		} catch {
			return c.json({ error: "Token is invalid" }, 400);
		}

		const db = getDrizzle();
		let dbUser = await db.query.user.findFirst({
			where: { email: normalizeEmail(email) },
		});

		if (!dbUser) {
			dbUser = await db
				.insert(user)
				.values({
					hashedPassword: hashPassword(form.password),
					email: normalizeEmail(email),
					displayEmail: email,
					apiKey: crypto.randomUUID(),
					id: crypto.randomUUID(),
				})
				.returning()
				.get();
		} else {
			await db
				.update(user)
				.set({ hashedPassword: hashPassword(form.password) })
				.where(eq(user.id, dbUser.id))
				.run();
		}

		const sealed = await sealData(
			{ email: dbUser.email },
			{ password: process.env.SECRET_KEY, ttl: 60 * 60 * 24 * 365 },
		);

		c.header("Set-Cookie", makeSessionCookie(sealed));
		return c.json({ ok: true });
	},
);

// Get workouts
api.get("/workouts", async (c) => {
	const cookie = c.req.header("Cookie")?.match(/__session=([^;]+)/)?.[1];
	const dbUser = await getSessionUser(cookie);
	if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

	const db = getDrizzle();
	const { getWorkouts } = await import("~/db/queries");
	const workouts = await getWorkouts({ dbUser, db });
	return c.json(workouts);
});

// Create workout
api.post(
	"/workouts",
	zValidator(
		"json",
		z.object({
			description: z.string().min(1),
			value: z.string(),
		}),
	),
	async (c) => {
		const cookie = c.req.header("Cookie")?.match(/__session=([^;]+)/)?.[1];
		const dbUser = await getSessionUser(cookie);
		if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

		const form = c.req.valid("json");
		const { value: numberValue, isTime } = getNumberValue(form.value);

		const db = getDrizzle();
		await db
			.insert(workout)
			.values({
				userId: dbUser.id,
				date: new Date(),
				id: crypto.randomUUID(),
				numberValue,
				value: form.value,
				isTime,
				description: form.description,
			})
			.run();

		return c.json({ ok: true });
	},
);

// Delete workout
api.delete("/workouts/:id", async (c) => {
	const cookie = c.req.header("Cookie")?.match(/__session=([^;]+)/)?.[1];
	const dbUser = await getSessionUser(cookie);
	if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

	const id = c.req.param("id");
	const db = getDrizzle();
	await db
		.delete(workout)
		.where(and(eq(workout.userId, dbUser.id), eq(workout.id, id)))
		.run();

	return c.json({ ok: true });
});

// Update workout
api.patch(
	"/workouts/:id",
	zValidator(
		"json",
		z.object({
			date: z.coerce.date().nullable().optional(),
			comment: z.string().optional(),
			value: z.string().min(1).optional(),
		}),
	),
	async (c) => {
		const cookie = c.req.header("Cookie")?.match(/__session=([^;]+)/)?.[1];
		const dbUser = await getSessionUser(cookie);
		if (!dbUser) return c.json({ error: "Unauthorized" }, 401);

		const id = c.req.param("id");
		const { date, comment, value } = c.req.valid("json");
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
				.where(and(eq(workout.userId, dbUser.id), eq(workout.id, id)))
				.run();
		}

		return c.json({ ok: true });
	},
);

export type AppType = typeof api;
export default api;
