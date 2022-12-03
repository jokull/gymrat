import { createTRPCProxyClient, httpLink, loggerLink } from "@trpc/client";
import { headers } from "next/headers";

import { type AppRouter } from "api/router";
import superjson from "superjson";

const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    loggerLink({ enabled: () => true }),
    httpLink({
      url: `${process.env.HOST}/api/trpc`,
      fetch(url, options) {
        return fetch(url, { ...options, credentials: "include" });
      },
      headers: () => {
        return { cookie: headers().get("cookie") ?? "" };
      },
    }),
  ],
});

export default async function Page() {
  const workouts = await api.workouts.query();
  return (
    <div>
      {workouts.map((workout) => (
        <div key={workout.id}>{workout.date.toLocaleDateString()}</div>
      ))}
    </div>
  );
}
