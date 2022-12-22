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

export const middleware = async (req: NextRequest) => {
  if (isPublic(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/trpc")) {
    return await fetch(
      `https://${process.env.TRPC_HOST ?? ""}${
        req.nextUrl.pathname
      }?${req.nextUrl.searchParams.toString()}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: req.headers.get("cookie") ?? "",
        },
        body: await req.text(),
      }
    );
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
