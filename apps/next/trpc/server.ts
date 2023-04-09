import "server-only";

import { type AppRouter } from "@gymrat/api";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import { headers } from "next/headers";
import superjson from "superjson";

const protocol = process.env.HOST === "gymrat.hundrad.is" ? "http" : "https";
const url = `${protocol}://${process.env.TRPC_HOST ?? ""}/trpc`;

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    loggerLink({ enabled: () => process.env.NODE_ENV === "development" }),
    httpBatchLink({
      url,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
          cache: "no-cache",
        });
      },
      headers: () => {
        return { cookie: headers().get("cookie") ?? "" };
      },
    }),
  ],
});
