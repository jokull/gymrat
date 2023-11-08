import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import Header from "./_components/header-";
import { Promo } from "./_components/promo-";

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      <Header page="index" />
      <div className="my-4 flex grow flex-col gap-4 sm:my-8 sm:gap-8">
        <div
          className="my-8 bg-clip-text bg-no-repeat text-center text-4xl font-black leading-tight text-transparent sm:text-5xl md:-mx-24 md:text-6xl"
          style={{
            backgroundImage: "url(/background.svg)",
            backgroundSize: "cover",
            backgroundPosition: "50% 50%",
          }}
        >
          A simple journal <br /> for workouts
        </div>
        <p className="text-center text-sm font-medium text-neutral-200">
          Try out a demo of the UI below
        </p>
        <div className="min-h-[340px]">
          <Promo />
        </div>
        <div className="mb-8 text-center font-light leading-tight text-neutral-400">
          Gymrat only uses two fields; description and value. If you use units
          like <strong>kg</strong>, <strong>lb</strong> or even{" "}
          <strong>rounds</strong> Gymrat will track the highest score for all
          workouts with that description. A star{" "}
          <StarIcon className="-mt-1 inline h-4 w-4 text-yellow-500" /> icon
          will be displayed by your personal best. Units like{" "}
          <strong>2:20</strong> or <strong>90 sec</strong> will display a star
          for the lowest interpreted value for that workout.
          <br />
          <br />
          With this simple parsing method you’ll fit your own workout routine
          and workouts, CrossFit, weightlifting, oly or even completely
          different use cases into this simple and intelligent scratchpad.
        </div>
      </div>
      <footer className="pb-12">
        <p className="text-center text-xs text-neutral-700">
          <Link href="https://github.com/jokull/gymrat">GitHub</Link>
        </p>
      </footer>
    </div>
  );
}
