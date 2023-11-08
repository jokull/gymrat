import Link from "next/link";

import { sendVerificationEmail } from "~/db/actions";

import { Form } from "../_components/form";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-medium">Forgot password</h2>
        <p className="text-sm text-neutral-600">
          <Link href="/login" className="text-neutral-50 underline">
            Login
          </Link>
        </p>
      </div>
      <Form action={sendVerificationEmail} />
      <p className="text-sm text-neutral-400">
        Don’t have an account yet?{" "}
        <Link className="text-neutral-50 underline" href="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
