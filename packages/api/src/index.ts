import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import jwt, { JwtPayload } from "@tsndr/cloudflare-worker-jwt";
import { parse } from "cookie";

import { appRouter, createContextFactory } from "./router";

export interface Env {
  DB: D1Database;
  CLERK_JWT_KEY: string;
}

export type JwtPayloadTemplate = JwtPayload & { email: string };

async function getClerkAuth(
  request: Request,
  jwtKey: string
): Promise<
  | { status: "invalid" }
  | { status: "unauthorized" }
  | { status: "authorized"; jwt: JwtPayloadTemplate }
> {
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
    const verified = await jwt.verify(sessToken, publicKey, {
      algorithm: "RS256",
    });
    if (!verified) {
      return { status: "invalid" };
    }
    var decoded = jwt.decode(sessToken);
  } catch (error) {
    return { status: "invalid" };
  }

  // We have manually added email to the JWT template
  const payload = {
    ...decoded.payload,
    email: decoded.payload.email as string,
  };

  return { status: "authorized", jwt: payload };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const auth = await getClerkAuth(request, env.CLERK_JWT_KEY);
    let user = null;
    if (auth.status === "authorized") {
      user = auth.jwt;
    }
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext: createContextFactory(env.DB, user),
    });
  },
};
