import { getAuth, withClerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Set the paths that don't require the user to be signed in
const publicPaths = ["/", "/sign-in*", "/sign-up*", "/api*"];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );
};

export default withClerkMiddleware(async (request: NextRequest) => {
  // if (request.nextUrl.pathname.startsWith("/trpc")) {
  //   const url = new URL(request.url);
  //   url.host = process.env.TRPC_HOST ?? "";

  //   try {
  //     const response = await fetch(url.toString(), {
  //       method: request.method,
  //       headers: { cookie: request.headers.get("cookie") ?? "" }, // Should include the Clerk session
  //       redirect: "manual",
  //     });
  //     if (response.status === 200) {
  //       return new NextResponse(response.body, { headers: response.headers });
  //     } else {
  //       console.error(await response.text());
  //       throw new Error();
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     return new NextResponse("server error", { status: 500 });
  //   }
  // }

  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // if the user is not signed in redirect them to the sign in page.
  const { userId } = getAuth(request);

  if (!userId) {
    // redirect the users to /pages/sign-in/[[...index]].ts

    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

export const config = { matcher: "/((?!.*\\.).*)" };