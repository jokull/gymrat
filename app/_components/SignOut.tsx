"use client";

import { useRouter } from "next/navigation";

import { Ghost } from "~/components/Button";

function Inner() {
  const router = useRouter();
  return (
    <Ghost
      className="border border-neutral-500"
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
