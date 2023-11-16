"use client";

import { useRouter } from "next/navigation";

import { Ghost } from "~/components/button-";

function Inner() {
  const router = useRouter();
  return (
    <Ghost
      className="border border-slate-500"
      onClick={() => {
        router.push("/api/logout");
      }}
    >
      Sign out
    </Ghost>
  );
}

export function SignOut() {
  return <Inner />;
}
