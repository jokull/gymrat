import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import Header from "./components/Header";
import { Promo } from "./components/Promo";

export default async function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* @ts-expect-error github.com/microsoft/TypeScript/pull/51328 */}
      <Header page="index" />
      <div className="my-4 sm:my-8 flex flex-col gap-4 sm:gap-8 grow">
        <div className="text-xl sm:text-4xl font-bold text-center leading-tight my-8">
          The simple way to track your progress in the gym
        </div>
        <div className="min-h-[340px]">
          <Promo />
        </div>
        <div className="font-light text-center leading-tight mb-8 text-neutral-400">
          Gymrat only uses two fields; description and value. If you use units
          like <strong>kg</strong>, <strong>lb</strong> or even{" "}
          <strong>rounds</strong> Gymrat will track the highest score for all
          workouts with that description. A star{" "}
          <StarIcon className="text-yellow-500 w-4 h-4 inline -mt-1" /> icon
          will be displayed by your personal best. Units like{" "}
          <strong>2:20</strong> or <strong>90 sec</strong> will display a star
          for the lowest interpreted value for that workout.
          <br />
          <br />
          With this simple parsing method you'll fit your own workout routine
          and workouts, CrossFit, weightlifting, oly or even completely
          different use cases into this simple and intelligent scratchpad.
        </div>
      </div>
      <footer className="mb-12">
        <p className="text-xs text-neutral-700 text-center">
          <Link href="https://github.com/jokull/gymrat">GitHub</Link>
        </p>
      </footer>
    </div>
  );
}
