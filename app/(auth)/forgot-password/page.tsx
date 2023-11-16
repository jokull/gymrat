import Link from "next/link";

import { sendVerificationEmail } from "~/db/node-actions";

import { Form } from "../_components/form";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/require-await
export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-medium">Forgot password</h2>
        <p className="text-sm text-slate-600">
          <Link href="/login" className="text-slate-50 underline">
            Login
          </Link>
        </p>
      </div>
      <Form action={sendVerificationEmail} />
      <p className="text-sm text-slate-400">
        Don’t have an account yet?{" "}
        <Link className="text-slate-50 underline" href="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
