import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import superjson from "superjson";
import { type AppRouter } from "../server/trpc";

const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `http://127.0.0.1:3800/api/trpc`,
      // url: `https://gymrat-api.solberg.workers.dev/trpc`,
      headers: { Authorization: "jokull" },
    }),
  ],
});

export default async function Home() {
  const { greeting } = await api.hello.query({ text: "hi" });
  return <div>{greeting}</div>;
}

// export default async function Home() {
//   const workouts = await api.workouts.query();
//   return (
//     <div>
//       {workouts.map((workout) => (
//         <div key={workout.id}>{workout.date.toLocaleDateString()}</div>
//       ))}
//     </div>
//   );
// }
