import { Link } from "@tanstack/react-router";

export function DefaultNotFound() {
	return (
		<div className="flex min-h-64 flex-col items-center justify-center gap-4 p-4">
			<p className="text-slate-400">The page you are looking for does not exist.</p>
			<Link to="/" className="text-sm text-slate-50 underline">
				Back home
			</Link>
		</div>
	);
}
