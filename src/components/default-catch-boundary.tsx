import { ErrorComponent, Link, useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

import { Ghost } from "~/components/button-";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	const router = useRouter();

	return (
		<div className="flex min-h-64 flex-col items-center justify-center gap-6 p-4">
			<ErrorComponent error={error} />
			<div className="flex flex-wrap items-center gap-2">
				<Ghost
					className="border border-slate-500"
					onClick={() => {
						void router.invalidate();
					}}
				>
					Try Again
				</Ghost>
				<Link to="/" className="text-sm text-slate-400 underline">
					Home
				</Link>
			</div>
		</div>
	);
}
