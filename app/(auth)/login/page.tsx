import Link from "next/link";

import { Form } from "./_components/form";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-medium">Login</h2>
        <p className="text-sm text-slate-600">
          <Link href="/forgot-password" className="text-slate-50 underline">
            Forgot password
          </Link>
        </p>
      </div>
      <Form />
      <p className="text-sm text-slate-400">
        Don't have an account yet?{" "}
        <Link className="text-slate-50 underline" href="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
