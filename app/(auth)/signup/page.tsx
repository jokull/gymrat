import Link from "next/link";

import { Form } from "../_components/form";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-medium">Signup</h2>
        <p className="text-sm text-slate-600">
          <Link href="/forgot-password" className="text-slate-50 underline">
            Forgot password
          </Link>
        </p>
      </div>
      <Form />
      <p className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link className="text-slate-50 underline" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
