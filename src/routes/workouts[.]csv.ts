import { createFileRoute } from "@tanstack/react-router";

import { getDrizzle } from "~/db/client";
import { getWorkouts } from "~/db/queries";
import { getSessionCookie, getSessionUser, unsealCsvToken } from "~/src/lib/session";

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function csvField(value: string): string {
	return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

async function resolveUser(request: Request) {
	const token = new URL(request.url).searchParams.get("token");
	const db = getDrizzle();

	if (token) {
		const userId = await unsealCsvToken(token);
		if (!userId) return null;
		return (await db.query.user.findFirst({ where: { id: userId } })) ?? null;
	}

	const cookie = request.headers.get("Cookie") ?? undefined;
	return getSessionUser(getSessionCookie(cookie));
}

export const Route = createFileRoute("/workouts.csv")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const dbUser = await resolveUser(request);
				if (!dbUser) {
					return Response.redirect(new URL("/login", request.url), 302);
				}

				const db = getDrizzle();
				const workouts = (await getWorkouts({ dbUser, db })).map(
					({ maxScore, minScore, isTime, numberValue, ...workout }) => ({
						isTopScore: (isTime ? minScore : maxScore) === numberValue,
						numberValue,
						...workout,
					}),
				);

				const headers = [
					"id",
					"numberValue",
					"date",
					"description",
					"isTopScore",
					"value",
					"comment",
				] as const;
				const rows = workouts.map((workout) =>
					headers.map((header) => {
						const value = workout[header];
						if (value instanceof Date) {
							return formatDate(value);
						}
						return csvField(String(value ?? ""));
					}),
				);
				const body = [headers, ...rows].map((row) => row.join(",")).join("\n");

				return new Response(body, {
					headers: {
						"content-type": "text/csv;charset=utf-8;",
						"cache-control": "no-cache, no-store, max-age=0",
						"content-disposition": "attachment; filename=gymrat-workouts.csv",
					},
				});
			},
		},
	},
});
