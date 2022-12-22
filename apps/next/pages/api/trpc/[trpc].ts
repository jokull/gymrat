import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const pathname = req.nextUrl.pathname.slice(4);
  const protocol = process.env.HOST === "gymrat.hundrad.is" ? "http" : "https";
  const host = process.env.TRPC_HOST ?? "";
  const searchParams = req.nextUrl.searchParams.toString();
  const url = `${protocol}://${host}${pathname}?${searchParams}`;
  return await fetch(url, {
    method: req.method,
    headers: {
      "content-type": "application/json",
      cookie: req.headers.get("cookie") ?? "",
    },
    ...(req.method === "POST" ? { body: await req.text() } : {}),
  });
}
