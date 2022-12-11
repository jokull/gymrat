import "server-only";

import { createTRPCProxyClient, httpLink, loggerLink } from "@trpc/client";
import { headers } from "next/headers";

import { type AppRouter } from "api/router";
import superjson from "superjson";

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    loggerLink({ enabled: () => process.env.NODE_ENV === "development" }),
    httpLink({
      url: `https://${process.env.VERCEL_URL ?? process.env.HOST}/trpc`,
      fetch(url, options) {
        return fetch(url, { ...options, credentials: "include" });
      },
      headers: () => {
        return { cookie: headers().get("cookie") ?? "" };
      },
    }),
  ],
});