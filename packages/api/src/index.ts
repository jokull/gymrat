import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { parse } from "cookie";

import { appRouter, createContextFactory } from "./router";

export interface Env {
  DB: D1Database;
  CLERK_JWT_KEY: string;
}

async function getClerkAuth(request: Request, jwtKey: string) {
  const splitPem = jwtKey.match(/.{1,64}/g)!;
  const publicKey =
    "-----BEGIN PUBLIC KEY-----\n" +
    splitPem.join("\n") +
    "\n-----END PUBLIC KEY-----";

  const cookie = parse(request.headers.get("Cookie") ?? "");
  const sessToken = cookie.__session ?? "";

  if (!sessToken) {
    return { status: "unauthorized" };
  }

  try {
    // Replace with verify when Clerk supports CloudFlare Worker environment
    // var decoded = await jwt.verify(sessToken, publicKey);
    var decoded = await jwt.decode(sessToken);
  } catch (error) {
    return { status: "invalid" };
  }

  return { status: "authorized", email: decoded.payload.email! };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const auth = await getClerkAuth(request, env.CLERK_JWT_KEY);
    const user = (auth.status === "authorized" && auth.email) ?? null;
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext: createContextFactory(env.DB, user),
    });
  },
};
