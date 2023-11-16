import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

import Header from "./_components/header-";
import { Promo } from "./_components/promo-";

export const runtime = "edge";

// eslint-disable-next-line @typescript-eslint/require-await
export default async function Home() {
  return (
    <div className="flex h-full flex-col">
      <Header page="index" />
      <div className="my-4 flex grow flex-col gap-4 sm:my-8 sm:gap-8">
        <div className="flex flex-col items-center gap-2 align-middle">
          <Image
            src="/the-gymrat.png"
            height={120}
            width={120}
            alt="The Gymrat"
            className="shrink-0"
          />
          <div
            className="my-8 bg-cover bg-clip-text bg-no-repeat text-center text-3xl font-black leading-tight text-transparent sm:text-4xl md:-mx-24 md:text-5xl"
            style={{
              backgroundImage: "url(/background.svg?1)",
              backgroundPosition: "50% 50%",
            }}
          >
            The Notepad for Gymrats
          </div>
        </div>
        <p className="text-center text-sm font-medium text-slate-200">
          Try out a demo of the UI below - then sign up for free!
        </p>
        <div className="min-h-[340px]">
          <Promo />
        </div>
        <div className="mb-8 text-center text-slate-200 [&>p]:mb-4">
          <p>Gymrat only uses two fields; workout and value.</p>
          <p>
            If the value ends with <strong>kg</strong>, <strong>lb</strong> or{" "}
            <strong>rounds</strong> Gymrat will track the highest score across
            those same workouts.{" "}
          </p>
          <p>
            A star <StarIcon className="-mt-1 inline h-4 w-4 text-yellow-500" />{" "}
            icon will be displayed by your personal best.{" "}
          </p>
          <p>
            Time units like <strong>2:20</strong> or <strong>90 sec</strong>{" "}
            will display a star for the lowest value for that workout - since a
            lower value is better for those workouts. Gymrat is clever like
            that.
          </p>
        </div>
      </div>
      <footer className="pb-12">
        <p className="text-center text-xs text-slate-700">
          <Link href="https://github.com/jokull/gymrat">GitHub</Link>
        </p>
      </footer>
    </div>
  );
}
