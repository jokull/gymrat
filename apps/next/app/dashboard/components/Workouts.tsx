"use client";

import { inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "api/router";
import superjson from "superjson";
import { trpc } from "../../../trpc/client";
import { ClientProvider } from "../../components/ClientProvider";

type RouterOutput = inferRouterOutputs<AppRouter>;

type Props = {
  initialWorkouts: ReturnType<typeof superjson.serialize>;
};

function Workouts({ initialWorkouts }: Props) {
  const { data: workouts } = trpc.workouts.useQuery(undefined, {
    initialData:
      superjson.deserialize<RouterOutput["workouts"]>(initialWorkouts),
  });
  return (
    <div>
      {workouts?.map((workout) => (
        <div key={workout.id}>{workout.date.toLocaleDateString("is-IS")}</div>
      ))}
    </div>
  );
}

export default (props: Props) => {
  return (
    <ClientProvider>
      <Workouts {...props} />
    </ClientProvider>
  );
};

// export default function Workouts({
//   initialWorkouts: workouts,
// }: {
//   initialWorkouts: RouterOutput["workouts"];
// }) {
//   console.log({ workouts });
//   return (
//     <div>
//       {workouts.map((workout) => (
//         <div key={workout.id}>{workout.date.toLocaleDateString()}</div>
//       ))}
//     </div>
//   );
// }
