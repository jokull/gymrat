import { notFound } from "next/navigation";

import { unsealVerificationToken } from "~/utils/auth";

import { Form } from "./_components/form";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const token = new URLSearchParams(
		Object.entries(params).flatMap(([key, value]) =>
			typeof value === "string" ? [[key, value]] : [],
		),
	).get("token");

	if (!token) {
		notFound();
	}

	const email = await unsealVerificationToken(token);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-baseline justify-between">
				<h2 className="text-xl font-medium">Choose password</h2>
			</div>
			<Form token={token} email={email} />
		</div>
	);
}
