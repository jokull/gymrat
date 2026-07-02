import { createFileRoute, Link } from "@tanstack/react-router";

import { Form } from "~/src/components/login-form";

export const Route = createFileRoute("/_guest/login")({ component: Login });

function Login() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-baseline justify-between">
				<h2 className="text-xl font-medium">Login</h2>
				<p className="text-sm text-slate-600">
					<Link to="/forgot-password" className="text-slate-50 underline">
						Forgot password
					</Link>
				</p>
			</div>
			<Form />
			<p className="text-sm text-slate-400">
				Don't have an account yet?{" "}
				<Link className="text-slate-50 underline" to="/signup">
					Sign up
				</Link>
			</p>
		</div>
	);
}
