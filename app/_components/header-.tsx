import { ArrowRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { unsealData } from "iron-session/edge";
import { cookies } from "next/headers";
import Link from "next/link";

import { GhostLink, PrimaryLink } from "~/components/button-";

import { SignOut } from "./sign-out";

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
    <header className="flex items-center justify-between gap-2 whitespace-nowrap md:gap-4">
      <Link href="/" className="flex grow items-center gap-1">
        <StarIcon className="-mt-1 h-4 w-4" />
        <h1 className="font-extrabold uppercase">Gymrat</h1>
      </Link>
      <>
        {"email" in session ? (
          <>
            {page === "dashboard" ? (
              <>
                <div className="min-w-0 truncate text-neutral-500">
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
                <ArrowRightIcon className="h-4 w-4" />
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
