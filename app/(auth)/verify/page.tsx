import { notFound } from "next/navigation";

import { setPassword } from "~/db/actions";
import { unsealVerificationToken } from "~/utils/auth";

import { Form } from "./_components/form";

export const runtime = "edge";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const token = new URLSearchParams(
    Object.entries(searchParams).flatMap(([key, value]) =>
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
      <Form token={token} email={email} action={setPassword} />
    </div>
  );
}
