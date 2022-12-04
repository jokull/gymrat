import { httpBatchLink } from "@trpc/client";

import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "api/router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export const client = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: "/api/trpc",
      fetch(url, options) {
        return fetch(url, { ...options, credentials: "include" });
      },
    }),
  ],
});
