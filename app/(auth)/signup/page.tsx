import Link from "next/link";

import { sendVerificationEmail } from "~/db/node-actions";

import { Form } from "../_components/form";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/require-await
export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-medium">Signup</h2>
        <p className="text-sm text-neutral-600">
          <Link href="/forgot-password" className="text-neutral-50 underline">
            Forgot password
          </Link>
        </p>
      </div>
      <Form action={sendVerificationEmail} />
      <p className="text-sm text-neutral-400">
        Already have an account?{" "}
        <Link className="text-neutral-50 underline" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
