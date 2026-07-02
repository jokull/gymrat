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
