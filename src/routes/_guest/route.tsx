import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import Header from "~/src/components/header";
import { userQueryOptions } from "~/src/lib/auth";

/**
 * Guest layout: shared shell for the auth pages. Logged-in users are
 * redirected straight to the dashboard.
 */
export const Route = createFileRoute("/_guest")({
	component: GuestLayout,
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData({
			...userQueryOptions(),
			revalidateIfStale: true,
		});
		if (user) {
			// oxlint-disable-next-line typescript/only-throw-error -- TanStack Router redirects are thrown
			throw redirect({ to: "/dashboard" });
		}
	},
});

function GuestLayout() {
	return (
		<div className="flex h-full flex-col">
			<Header page="auth" />
			<div className="my-4 flex grow flex-col gap-4 sm:my-8 sm:gap-8">
				<Outlet />
			</div>
		</div>
	);
}
