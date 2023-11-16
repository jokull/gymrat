"use client";

import { addDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { CreateWorkoutFieldset } from "~/app/dashboard/_components/create-workout";
import { WorkoutRow } from "~/app/dashboard/_components/workouts-";
import { QueryWorkout } from "~/db/queries";
import { getNumberValue } from "~/utils/workouts";

type PromoWorkout = Pick<
  QueryWorkout,
  "id" | "description" | "date" | "numberValue" | "value" | "isTime"
>;

export function Promo() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [today] = useState(new Date());
  const [promoWorkouts, setPromoWorkouts] = useState<
    Omit<PromoWorkout, "isTime">[]
  >(
    [
      {
        id: "1",
        description: "500 m row",
        date: addDays(today, -7),
        numberValue: 90,
        value: "2:30 min",
      },
      {
        id: "2",
        description: "Back Squat 3x",
        date: addDays(today, -3),
        numberValue: 95,
        value: "95 kg",
      },
      {
        id: "3",
        description: "Back Squat 3x",
        date: addDays(today, -5),
        numberValue: 92,
        value: "92 kg",
      },
      {
        id: "4",
        description: "Back Squat 3x",
        date: addDays(today, -1),
        numberValue: 100,
        value: "100 kg",
      },
      {
        id: "5",
        description: "Back Squat 3x",
        date: today,
        numberValue: 105,
        value: "105 kg",
      },
    ].reverse(),
  );
  const [maxScore, setMaxScore] = useState<number>(105);

  const workouts: (PromoWorkout & { maxScore: number; minScore: number })[] =
    promoWorkouts.map((workout) => ({
      ...workout,
      maxScore,
      minScore: -1,
      isTime: workout.value.match(/\:/)?.[0] ? true : false,
    }));

  return (
    <div>
      <form
        className="relative mb-4"
        onSubmit={(event) => {
          event.preventDefault();
          setHasInteracted(true);
          const form = new FormData(event.currentTarget);
          const value = form.get("value");
          const description = form.get("description");
          if (typeof value !== "string" || typeof description !== "string") {
            return;
          }
          setMaxScore((oldMaxScore) => {
            const newMaxScore = getNumberValue(value).value;
            return newMaxScore > oldMaxScore ? newMaxScore : oldMaxScore;
          });
          setPromoWorkouts((workouts) => [
            {
              id: Math.random().toString(),
              value: value,
              numberValue: getNumberValue(value).value,
              isTime: value.match(/\:/)?.[0] ? true : false,
              date: new Date(),
              description,
            },
            ...workouts,
          ]);
        }}
      >
        <CreateWorkoutFieldset
          workoutDescriptions={workouts.map(({ description }) => ({
            description,
          }))}
          isPromo={true}
        />
      </form>
      <AnimatePresence>
        {hasInteracted && (
          <motion.div
            layout
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -10 }}
            className="my-8 rounded-md bg-teal-600/20 px-3 py-2 text-center font-medium text-teal-600"
          >
            <p>This is only a demo - Sign up to save your workouts</p>
            <p className="mt-1 text-xs">Gymrat is 100% free!</p>
          </motion.div>
        )}
      </AnimatePresence>
      {workouts.length > 0 ? (
        <div className="flex flex-col gap-1 py-4">
          <AnimatePresence>
            {workouts.map((workout, i) => (
              <motion.div
                layout
                transition={{
                  delay: hasInteracted ? 0 : workouts.length * 0.1 - i * 0.1,
                  type: "spring",
                }}
                initial={{ opacity: 0, y: -30 * i - 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 * i + 10 }}
                key={workout.id}
                className="group rounded-md p-2 text-neutral-400 data-active:bg-white/5"
                data-headlessui-state={i === 0 ? "active" : ""}
              >
                <WorkoutRow
                  active={false}
                  checked={false}
                  workout={{ ...workout, comment: null }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}
