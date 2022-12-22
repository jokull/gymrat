import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { parse } from "cookie";
import { unsealData } from "iron-session/edge";

import { getQueryBuilder } from "./db";
import { appRouter, createContextFactory } from "./router";
import { Env, SessionUser } from "./types";

async function getSession(
  request: Request,
  secretKey: string
): Promise<
  | { status: "invalid" }
  | { status: "unauthorized" }
  | { status: "authorized"; user: SessionUser }
> {
  const seal = parse(request.headers.get("Cookie") ?? "").__session || "";

  if (!seal) {
    return { status: "unauthorized" };
  }

  let user;
  try {
    user = await unsealData<SessionUser | Record<string, never>>(seal, {
      password: secretKey,
    });
  } catch (error) {
    return { status: "invalid" };
  }

  if (Object.keys(user).length === 0) {
    return { status: "invalid" };
  }

  return { status: "authorized", user: user as SessionUser };
}

async function getUser(d1: Env["DB"], id: string) {
  const db = getQueryBuilder(d1);
  return await db
    .selectFrom("User")
    .selectAll()
    .where("User.id", "=", id)
    .executeTakeFirst();
}

async function getUserFromApiKey(request: Request, d1: Env["DB"]) {
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
    const session = await getSession(request, env.SECRET_KEY);

    let user: Awaited<ReturnType<typeof getUser>> | null = null;
    if (session.status === "authorized") {
      user = (await getUser(env.DB, session.user.id)) ?? null;
    } else {
      user = null;
    }

    user = user ?? (await getUserFromApiKey(request, env.DB)) ?? null;

    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext: createContextFactory(env, user),
      onError({ error }) {
        console.error("Error:", error);
        if (error.code === "INTERNAL_SERVER_ERROR") {
          // send to bug reporting
        }
      },
      responseMeta({ ctx, paths, errors }) {
        const allOk = errors.length === 0;
        if (
          allOk &&
          ctx?._session &&
          paths?.find((path) => ["setPassword", "login"].includes(path))
        ) {
          return {
            headers: {
              "set-cookie": `__session=${ctx._session}; Max-Age=2592000; SameSite=Strict; Path=/; Secure; HttpOnly`,
            },
          };
        }
        return {};
      },
    });
  },
};
