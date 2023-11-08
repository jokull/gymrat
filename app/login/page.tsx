import Link from "next/link";

import { login } from "~/db/actions";

import { Form } from "./_components.tsx/form";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-medium">Login</h2>
        <p className="text-sm text-neutral-600">
          <Link href="/forgot-password" className="text-neutral-50 underline">
            Forgot password
          </Link>
        </p>
      </div>
      <Form action={login} />
      <p className="text-sm text-neutral-400">
        Don't have an account yet?{" "}
        <Link className="text-neutral-50 underline" href="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
