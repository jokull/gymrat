"use client";

import { useClerk } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

import { Ghost } from "@/components/Button";

function Inner() {
  const { signOut } = useClerk();
  const router = useRouter();
  return (
    <Ghost
      onClick={() =>
        void signOut().then(() => {
          router.push("/");
        })
      }
    >
      Sign out
    </Ghost>
  );
}

export default function SignOut() {
  return <Inner />;
}
