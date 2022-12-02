import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../server/trpc";

import { type NextRequest } from "next/server";

export interface Env {
  DB: D1Database;
}

export default function handler(
  req: NextRequest & { env: Env },
  ctx: ExecutionContext,
  env: Env
) {
  console.log(JSON.stringify(req.env));
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req: req,
    createContext: () => {
      return {};
    },
  });
}

export const config = {
  runtime: "experimental-edge",
};
