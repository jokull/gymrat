import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import Header from "~/src/components/header";
import { Form } from "~/src/components/verify-form";
import { $verifyToken } from "~/src/lib/auth";

export const Route = createFileRoute("/verify")({
	validateSearch: z.object({ token: z.string().optional() }),
	loaderDeps: ({ search }) => ({ token: search.token }),
	loader: async ({ deps }) => {
		if (!deps.token) return { token: null, email: null };
		const result = await $verifyToken({ data: { token: deps.token } });
		return { token: deps.token, email: result?.email ?? null };
	},
	component: Verify,
});

function Verify() {
	const { token, email } = Route.useLoaderData();

	return (
		<div className="flex h-full flex-col">
			<Header page="auth" />
			<div className="my-4 flex grow flex-col gap-4 sm:my-8 sm:gap-8">
				{!token || !email ? (
					<p className="text-center text-slate-400">
						This verification link is invalid or has expired.
					</p>
				) : (
					<div className="flex flex-col gap-4">
						<div className="flex items-baseline justify-between">
							<h2 className="text-xl font-medium">Choose password</h2>
						</div>
						<Form token={token} email={email} />
					</div>
				)}
			</div>
		</div>
	);
}
