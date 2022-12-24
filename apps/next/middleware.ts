import { type SessionUser } from "@gymrat/api";
import { parse } from "cookie";
import { unsealData } from "iron-session/edge";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/auth*"];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );
};

async function trpcHandler(req: NextRequest) {
  const protocol = process.env.HOST === "gymrat.hundrad.is" ? "http" : "https";
  const host = process.env.TRPC_HOST ?? "";
  const searchParams = req.nextUrl.searchParams.toString();
  const url = `${protocol}://${host}${req.nextUrl.pathname}?${searchParams}`;
  return await fetch(url, {
    method: req.method,
    headers: {
      "content-type": "application/json",
      cookie: req.headers.get("cookie") ?? "",
    },
    ...(req.method === "POST" ? { body: await req.text() } : {}),
  });
}

export const middleware = async (req: NextRequest) => {
  if (req.nextUrl.pathname.startsWith("/trpc")) {
    return trpcHandler(req);
  }

  if (isPublic(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const seal = parse(req.headers.get("cookie") ?? "").__session;

  let user: SessionUser | null = null;

  if (seal) {
    const session = await unsealData<SessionUser | Record<string, never>>(
      seal,
      { password: process.env.SECRET_KEY ?? "" }
    );

    if ("email" in session) {
      user = session as SessionUser;
    }
  }

  if (!user) {
    return NextResponse.redirect(
      new URL(
        `/auth?screen=login&next=${encodeURIComponent(req.nextUrl.pathname)}`,
        req.url
      )
    );
  }
};

export const config = { matcher: "/((?!.*\\.).*)" };
