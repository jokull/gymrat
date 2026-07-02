import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import Header from "~/src/components/header";
import { userQueryOptions } from "~/src/lib/auth";

/**
 * Auth layout: protects all child routes; the resolved user is returned
 * as router context for children and their loaders.
 */
export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData({
			...userQueryOptions(),
			revalidateIfStale: true,
		});
		if (!user) {
			// oxlint-disable-next-line typescript/only-throw-error -- TanStack Router redirects are thrown
			throw redirect({ to: "/login" });
		}
		return { user };
	},
});

function AuthLayout() {
	return (
		<div className="flex h-full flex-col">
			<Header page="dashboard" />
			<div className="my-4 flex grow flex-col gap-4 pb-4 sm:my-8 sm:gap-8">
				<Outlet />
			</div>
		</div>
	);
}
