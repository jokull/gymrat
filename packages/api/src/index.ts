import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import jwt, { JwtPayload } from "@tsndr/cloudflare-worker-jwt";
import { parse } from "cookie";
import { User } from "kysely-codegen";
import { generateApiKey } from "./apiKeys";
import { getQueryBuilder } from "./db";

import { appRouter, createContextFactory } from "./router";

export interface Env {
  DB: D1Database;
  CLERK_JWT_KEY: string;
}

export type ClerkJwtPayload = JwtPayload & { email: string; id: string };

async function getClerkAuth(
  request: Request,
  jwtKey: string
): Promise<
  | { status: "invalid" }
  | { status: "unauthorized" }
  | { status: "authorized"; jwt: ClerkJwtPayload }
> {
  const splitPem = jwtKey.match(/.{1,64}/g)!;
  const publicKey =
    "-----BEGIN PUBLIC KEY-----\n" +
    splitPem.join("\n") +
    "\n-----END PUBLIC KEY-----";

  const sessToken = parse(request.headers.get("Cookie") ?? "").__session ?? "";

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
    id: decoded.payload.id as string,
  };

  return { status: "authorized", jwt: payload };
}

async function getUser(d1: Env["DB"], { id }: ClerkJwtPayload): Promise<User> {
  const db = getQueryBuilder(d1);
  let user = await db
    .selectFrom("User")
    .selectAll()
    .where("User.id", "=", id)
    .executeTakeFirst();
  if (!user) {
    user = await db
      .insertInto("User")
      .values({ id, apiKey: generateApiKey() })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
  return user;
}

async function getUserFromApiKey(
  request: Request,
  d1: Env["DB"]
): Promise<User | null> {
  const authHeader = request.headers.get("authorization");
  const db = getQueryBuilder(d1);
  return (
    (await db
      .selectFrom("User")
      .selectAll()
      .where("User.apiKey", "=", authHeader ?? "")
      .executeTakeFirst()) ?? null
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const clerkAuth = await getClerkAuth(request, env.CLERK_JWT_KEY);
    let jwt = null;
    let user = null;
    if (clerkAuth.status === "authorized") {
      jwt = clerkAuth.jwt;
      user = await getUser(env.DB, jwt);
    }

    user = user ?? (await getUserFromApiKey(request, env.DB));

    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext: createContextFactory(env.DB, user, jwt),
    });
  },
};
