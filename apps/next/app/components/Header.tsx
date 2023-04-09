import { ArrowRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { unsealData } from "iron-session/edge";
import { cookies } from "next/headers";
import Link from "next/link";

import { GhostLink, PrimaryLink } from "@/components/Button";

import SignOut from "./SignOut";

export default async function Header({
  page,
}: {
  page: "dashboard" | "index" | "auth";
}) {
  const session = await unsealData<
    { id: string; email: string } | Record<string, never>
  >(cookies().get("__session")?.value ?? "", {
    password: process.env.SECRET_KEY ?? "",
  });
  return (
    <header className="flex justify-between items-center gap-2 md:gap-4 whitespace-nowrap">
      <Link href="/" className="flex items-center gap-1 grow">
        <StarIcon className="w-4 h-4 -mt-1" />
        <h1 className="font-extrabold uppercase">Gymrat</h1>
      </Link>
      <>
        {"email" in session ? (
          <>
            {page === "dashboard" ? (
              <>
                <div className="truncate min-w-0 text-neutral-500">
                  <Link href="/dashboard">{session.email}</Link>
                </div>
                <SignOut />
              </>
            ) : (
              <GhostLink
                href="/dashboard"
                className="flex gap-2"
                prefetch={false}
              >
                <span>Dashboard</span>
                <ArrowRightIcon className="w-4 h-4" />
              </GhostLink>
            )}
          </>
        ) : (
          page === "index" && (
            <>
              <GhostLink href="/auth?screen=login">Sign In</GhostLink>
              <PrimaryLink href="/auth">Sign Up</PrimaryLink>
            </>
          )
        )}
      </>
    </header>
  );
}
