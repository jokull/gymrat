"use client";

import { Ghost } from "~/components/button-";

export function SignOut() {
	return (
		<Ghost
			className="border border-slate-500"
			onClick={() => {
				window.location.href = "/api/logout";
			}}
		>
			Sign out
		</Ghost>
	);
}
