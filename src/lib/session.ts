import { deleteCookie, setCookie } from "@tanstack/react-start/server";
import { sealData, unsealData } from "iron-session";
import { z } from "zod";

import { getDrizzle } from "~/db/client";

export const SESSION_COOKIE = "__session";

const sessionSchema = z.object({ email: z.string().email() });

export function getSessionCookie(cookieHeader: string | undefined) {
	return cookieHeader?.match(/__session=([^;]+)/)?.[1];
}

export async function getSessionUser(cookie: string | undefined) {
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

export async function setSessionCookie(email: string) {
	const sealed = await sealData(
		{ email },
		{ password: process.env.SECRET_KEY, ttl: 60 * 60 * 24 * 365 },
	);
	setCookie(SESSION_COOKIE, sealed, {
		maxAge: 2592000,
		path: "/",
		sameSite: "strict",
		secure: true,
		httpOnly: true,
	});
}

export function clearSessionCookie() {
	deleteCookie(SESSION_COOKIE, { path: "/" });
}

// Short-lived signed token granting read access to the CSV export without
// a session cookie (e.g. for handing to an AI agent). The purpose tag keeps
// it from being interchangeable with email verification tokens, which are
// sealed with the same secret.
const CSV_TOKEN_TTL = 60 * 60 * 24;

const csvTokenSchema = z.object({
	purpose: z.literal("csv-export"),
	userId: z.string(),
});

export async function sealCsvToken(userId: string) {
	return sealData(
		{ purpose: "csv-export", userId },
		{ password: process.env.SECRET_KEY, ttl: CSV_TOKEN_TTL },
	);
}

export async function unsealCsvToken(token: string) {
	try {
		const data = await unsealData(token, {
			password: process.env.SECRET_KEY,
			ttl: CSV_TOKEN_TTL,
		});
		const result = csvTokenSchema.safeParse(data);
		return result.success ? result.data.userId : null;
	} catch {
		return null;
	}
}
