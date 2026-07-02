import { createFileRoute } from "@tanstack/react-router";

import { workoutsQueryOptions } from "~/lib/use-workouts";
import { Dashboard } from "~/src/components/dashboard/dashboard";

export const Route = createFileRoute("/_auth/dashboard")({
	loader: ({ context }) => context.queryClient.ensureQueryData(workoutsQueryOptions()),
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = Route.useRouteContext();
	return <Dashboard apiKey={user.apiKey} />;
}
