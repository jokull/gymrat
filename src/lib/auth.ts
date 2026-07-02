import { queryOptions } from "@tanstack/react-query";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getCookie, setResponseStatus } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { WorkerMailer } from "worker-mailer";
import { sealData } from "iron-session";
import { z } from "zod";

import { getDrizzle } from "~/db/client";
import { hashPassword, normalizeEmail, verifyPassword } from "~/db/passwords";
import { user } from "~/schema";
import { unsealVerificationToken } from "~/utils/auth";

import { clearSessionCookie, getSessionUser, SESSION_COOKIE, setSessionCookie } from "./session";

/**
 * Resolves the current user from the iron-session cookie. Used via
 * userQueryOptions() so the _auth layout can protect its child routes.
 */
export const $getUser = createServerFn({ method: "GET" }).handler(async () => {
	const dbUser = await getSessionUser(getCookie(SESSION_COOKIE));
	if (!dbUser) return null;
	return { email: dbUser.email, apiKey: dbUser.apiKey };
});

export const userQueryOptions = () =>
	queryOptions({
		queryKey: ["user"],
		queryFn: ({ signal }) => $getUser({ signal }),
	});

export type User = Awaited<ReturnType<typeof $getUser>>;

/**
 * Forces authentication on server functions and adds the user to context.
 */
export const authMiddleware = createMiddleware().server(async ({ next }) => {
	const dbUser = await getSessionUser(getCookie(SESSION_COOKIE));

	if (!dbUser) {
		setResponseStatus(401);
		throw new Error("Unauthorized");
	}

	return next({ context: { user: dbUser } });
});

export const $login = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			email: z.string().email(),
			password: z.string().min(6),
		}),
	)
	.handler(async ({ data }) => {
		const email = normalizeEmail(data.email);
		const db = getDrizzle();
		const dbUser = await db.query.user.findFirst({ where: { email } });

		if (!dbUser) {
			return { error: "No user found" };
		}

		if (!verifyPassword(data.password, dbUser.hashedPassword)) {
			return { error: "This password is incorrect" };
		}

		await setSessionCookie(email);
		return { ok: true as const };
	});

export const $logout = createServerFn({ method: "POST" }).handler(() => {
	clearSessionCookie();
	return { ok: true as const };
});

// Send a verification email so the recipient can pick a (new) password.
// Used by both signup and forgot-password.
export const $signup = createServerFn({ method: "POST" })
	.inputValidator(z.object({ email: z.string().email() }))
	.handler(async ({ data }) => {
		const email = normalizeEmail(data.email);

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

		return {
			message:
				"Signup email was sent just now - follow the link in it to verify and finish signup - don't forget to check spam!",
		};
	});

export const $verifyToken = createServerFn({ method: "GET" })
	.inputValidator(z.object({ token: z.string() }))
	.handler(async ({ data }) => {
		try {
			const email = await unsealVerificationToken(data.token);
			return { email };
		} catch {
			return null;
		}
	});

export const $setPassword = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			password: z.string().min(6),
			token: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		let email: string;
		try {
			email = await unsealVerificationToken(data.token);
		} catch {
			return { error: "Token is invalid" };
		}

		const db = getDrizzle();
		let dbUser = await db.query.user.findFirst({
			where: { email: normalizeEmail(email) },
		});

		if (!dbUser) {
			dbUser = await db
				.insert(user)
				.values({
					hashedPassword: hashPassword(data.password),
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
				.set({ hashedPassword: hashPassword(data.password) })
				.where(eq(user.id, dbUser.id))
				.run();
		}

		await setSessionCookie(dbUser.email);
		return { ok: true as const };
	});
