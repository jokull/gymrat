import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useState } from "react";

import { Primary } from "~/components/button-";
import { Input } from "~/components/input-";
import { $signup } from "~/src/lib/auth";

function formString(form: FormData, name: string) {
	const value = form.get(name);
	return typeof value === "string" ? value : "";
}

export function Form() {
	const [message, setMessage] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setPending(true);
		setMessage(null);
		const formData = new FormData(e.currentTarget);
		void $signup({ data: { email: formString(formData, "email") } })
			.then((result) => {
				setMessage(result.message);
			})
			.catch(() => {
				setMessage("Something went wrong");
			})
			.finally(() => {
				setPending(false);
			});
	};

	return (
		<form className="mb-4 flex flex-col gap-4" onSubmit={handleSubmit}>
			<fieldset disabled={pending}>
				<div className="flex flex-col gap-4">
					<Input
						type="email"
						name="email"
						autoComplete="username"
						autoFocus
						autoCorrect="off"
						placeholder="Your email address"
					/>
					<Primary>Submit</Primary>
				</div>
			</fieldset>
			<AnimatePresence>
				{message && (
					<motion.div
						layout
						animate={{ opacity: 1, y: 0 }}
						initial={{ opacity: 0, y: -10 }}
						className="my-8 rounded-md bg-red-600/20 px-3 py-2 text-center font-medium text-red-500"
					>
						<p>{message}</p>
					</motion.div>
				)}
			</AnimatePresence>
		</form>
	);
}
