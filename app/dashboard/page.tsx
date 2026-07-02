import { redirect } from "next/navigation";

import { getWorkouts } from "~/db/queries";
import { getLoginContext } from "~/utils/session";

import { Dashboard } from "./_components/dashboard";

export default async function Page() {
	const { dbUser, db } = await getLoginContext();

	if (!dbUser) {
		redirect("/login");
	}

	const workouts = await getWorkouts({ dbUser, db });

	return <Dashboard workouts={workouts} apiKey={dbUser.apiKey} />;
}
