"use client";

import { Ghost } from "@/components/Button";
import { useClerk } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

function Inner() {
  const { signOut } = useClerk();
  const router = useRouter();
  return (
    <Ghost
      onClick={() =>
        signOut().then(() => {
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
