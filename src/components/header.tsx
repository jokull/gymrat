import { ArrowRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { GhostLink, PrimaryLink } from "~/components/button-";
import { userQueryOptions } from "~/src/lib/auth";

import { SignOut } from "./sign-out";

export default function Header({ page }: { page: "dashboard" | "index" | "auth" }) {
	const { data: user, isPending } = useQuery(userQueryOptions());
	return (
		<header className="flex items-center justify-between gap-2 whitespace-nowrap md:gap-4">
			<Link to="/" className="flex grow items-center gap-1">
				<StarIcon className="-mt-1 h-4 w-4" />
				<h1 className="font-extrabold uppercase">Gymrat</h1>
			</Link>
			{!isPending && (
				<>
					{user ? (
						<>
							{page === "dashboard" ? (
								<>
									<div className="min-w-0 truncate text-slate-500">
										<Link to="/dashboard">{user.email}</Link>
									</div>
									<SignOut />
								</>
							) : (
								<GhostLink to="/dashboard" className="flex gap-2">
									<span>Dashboard</span>
									<ArrowRightIcon className="h-4 w-4" />
								</GhostLink>
							)}
						</>
					) : (
						page === "index" && (
							<>
								<GhostLink to="/login">Sign In</GhostLink>
								<PrimaryLink to="/signup">Sign Up</PrimaryLink>
							</>
						)
					)}
				</>
			)}
		</header>
	);
}
