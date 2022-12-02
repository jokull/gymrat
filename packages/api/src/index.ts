import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContextFactory } from "./router";

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext | undefined
  ): Promise<Response> {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext: createContextFactory(env.DB),
    });
  },
};
