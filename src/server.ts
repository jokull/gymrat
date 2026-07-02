/**
 * Cloudflare Worker entry point.
 *
 * Copies Workers env bindings (vars + secrets) into process.env
 * so that server-side code can access them via process.env.KEY,
 * then delegates to the TanStack Start request handler.
 */
import handler from "@tanstack/react-start/server-entry";
import { env } from "cloudflare:workers";

export default {
	fetch(request: Request): Response | Promise<Response> {
		for (const [key, value] of Object.entries(env)) {
			if (typeof value === "string") {
				process.env[key] = value;
			}
		}
		return handler.fetch(request);
	},
};
