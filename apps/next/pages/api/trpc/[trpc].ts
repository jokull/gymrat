import { type NextRequest } from "next/server";

export default async function handler(req: NextRequest) {
  const url = new URL(req.url.replace("/api/trpc", "/trpc"));

  const apiUrl = new URL(
    `${process.env.API_ENDPOINT ?? ""}${
      url.pathname
    }?${url.searchParams.toString()}`
  );

  return await fetch(apiUrl.toString(), {
    method: req.method,
    headers: { cookie: req.headers.get("cookie") ?? "" }, // Should include the Clerk session
    redirect: "manual",
  });
}

export const config = {
  runtime: "experimental-edge",
};
