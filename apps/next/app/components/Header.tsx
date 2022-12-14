import { GhostLink, PrimaryLink } from "@/components/Button";
import { trpc } from "@/trpc/server";
import { SignedIn, SignedOut } from "@clerk/nextjs/app-beta";
import { ArrowRightIcon, StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import SignOut from "./SignOut";

async function User() {
  const user = await trpc.user.query();
  return (
    <Link href="/dashboard" className="text-neutral-500">
      {user?.clerk?.email}
    </Link>
  );
}

export default async function Header({
  page,
}: {
  page: "dashboard" | "index";
}) {
  return (
    <header className="flex justify-between items-center">
      <Link href="/" className="flex items-center gap-1">
        <StarIcon className="w-4 h-4 -mt-1" />
        <h1 className="font-extrabold uppercase">Gymrat</h1>
      </Link>
      <div>
        <SignedIn>
          <div className="flex items-center gap-2">
            {page === "dashboard" ? (
              <>
                <SignOut />
                {/* @ts-expect-error github.com/microsoft/TypeScript/pull/51328 */}
                <User />
              </>
            ) : (
              <GhostLink href="/dashboard" className="flex gap-2">
                <span>Dashboard</span>
                <ArrowRightIcon className="w-4 h-4" />
              </GhostLink>
            )}
          </div>
        </SignedIn>
        <SignedOut>
          <div className="flex gap-2">
            <GhostLink href="/sign-in">Sign In</GhostLink>
            <PrimaryLink href="/sign-up">Sign Up</PrimaryLink>
          </div>
        </SignedOut>
      </div>
    </header>
  );
}
