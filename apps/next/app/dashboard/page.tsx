import { currentUser } from "@clerk/nextjs/app-beta";
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
  const clerkUser = await currentUser();
  const user = await api.user.query();
  return (
    <div className="my-8 mx-auto max-w-md">
      <h1>Workouts</h1>
      <p>
        {clerkUser
          ? clerkUser.emailAddresses.find(
              (email) => email.id === clerkUser.primaryEmailAddressId
            )?.emailAddress
          : null}
      </p>
      <p>Token: {user.apiKey}</p>
      {workouts.map((workout) => (
        <div key={workout.id}>{workout.date.toLocaleDateString()}</div>
      ))}
    </div>
  );
}
