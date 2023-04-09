"use client";

import { getNumberValue, type Workout } from "@gymrat/api";
import { useField, useForm } from "@shopify/react-form";
import { addDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { CreateWorkout } from "../dashboard/components/CreateWorkout";
import { WorkoutRow } from "../dashboard/components/Workouts";

type PromoWorkout = Omit<Workout, "minScore" | "maxScore" | "isTime">;

export function Promo() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [today] = useState(new Date());
  const [promoWorkouts, setPromoWorkouts] = useState<PromoWorkout[]>(
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
    ].reverse()
  );
  const [maxScore, setMaxScore] = useState<number>(105);

  const workouts: Workout[] = promoWorkouts.map((workout) => ({
    ...workout,
    maxScore,
    minScore: -1,
    isTime: workout.value.match(/\:/)?.[0] ? true : false,
  }));

  const {
    submit,
    fields: { description, value },
  } = useForm({
    fields: {
      description: useField({
        value: {
          description: "Back Squat 3x",
          id: "",
          maxScore: 110,
          minScore: 110,
        },
        validates: [],
      }),
      value: useField("110 kg"),
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async onSubmit(values) {
      setHasInteracted(true);
      setMaxScore((oldMaxScore) => {
        const newMaxScore = getNumberValue(values.value).value;
        return newMaxScore > oldMaxScore ? newMaxScore : oldMaxScore;
      });
      setPromoWorkouts((workouts) => [
        {
          id: Math.random().toString(),
          value: values.value,
          numberValue: getNumberValue(values.value).value,
          isTime: false,
          date: new Date(),
          description: values.description.description,
        },
        ...workouts,
      ]);
      return { status: "success" };
    },
  });

  return (
    <div>
      <form
        className="mb-4 relative"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <CreateWorkout
          workouts={workouts}
          isLoading={false}
          description={description}
          value={value}
          isPromo={true}
        />
      </form>
      <AnimatePresence>
        {hasInteracted && (
          <motion.div
            layout
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -10 }}
            className="text-center py-2 px-3 bg-teal-600/20 text-teal-600 font-medium my-8 rounded-md"
          >
            <p>This is only a demo - Sign up to save your workouts</p>
            <p className="text-xs mt-1">Gymrat is 100% free!</p>
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
                className="data-active:bg-white/5 p-2 rounded-md group text-neutral-400"
                data-headlessui-state={i === 0 ? "active" : ""}
              >
                <WorkoutRow workout={workout} editable={false} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}
