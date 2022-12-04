import superjson from "superjson";
import { trpc } from "../../trpc/server";
import Workouts from "./components/Workouts";

export default async function Page() {
  const [workouts, user] = await Promise.all([
    trpc.workouts.query(),
    trpc.user.query(),
  ]);
  return (
    <div className="my-8 mx-auto max-w-md">
      <h1>Workouts</h1>
      <p>{user.clerk?.email}</p>
      <p>Token: {user.apiKey}</p>
      <Workouts initialWorkouts={superjson.serialize(workouts)} />
    </div>
  );
}
