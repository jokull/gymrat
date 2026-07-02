"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Primary } from "~/components/button-";
import { Input } from "~/components/input-";

export function Form({ email, token }: { email: string; token: string }) {
	const router = useRouter();
	const [message, setMessage] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setPending(true);
		setMessage(null);
		const formData = new FormData(e.currentTarget);
		void fetch("/api/set-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				password: formData.get("new-password"),
				token,
			}),
		}).then(async (res) => {
			if (res.ok) {
				router.push("/dashboard");
			} else {
				const data: { error?: string } = await res.json();
				setMessage(data.error ?? "Something went wrong");
				setPending(false);
			}
		});
	};

	return (
		<form className="mb-4 flex flex-col gap-4" onSubmit={handleSubmit}>
			<fieldset disabled={pending}>
				<div className="flex flex-col gap-4">
					<Input type="email" readOnly value={email} autoCorrect="off" />
					<Input
						type="password"
						autoComplete="new-password"
						name="new-password"
						placeholder="Choose a new password"
						autoFocus
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
