import { Ghost } from "~/components/button-";
import { $logout } from "~/src/lib/auth";

export function SignOut() {
	return (
		<Ghost
			className="border border-slate-500"
			onClick={() => {
				void $logout().then(() => {
					// Full reload so all cached state is dropped
					window.location.href = "/login";
				});
			}}
		>
			Sign out
		</Ghost>
	);
}
