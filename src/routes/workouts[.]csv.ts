import { createFileRoute } from "@tanstack/react-router";

import { getDrizzle } from "~/db/client";
import { getWorkouts } from "~/db/queries";
import { getSessionCookie, getSessionUser } from "~/src/lib/session";

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const Route = createFileRoute("/workouts.csv")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const cookie = request.headers.get("Cookie") ?? undefined;
				const dbUser = await getSessionUser(getSessionCookie(cookie));
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
				] as const;
				const rows = workouts.map((workout) =>
					headers.map((header) => {
						let value = workout[header];
						if (value instanceof Date) {
							value = formatDate(value);
						}
						return String(value);
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
