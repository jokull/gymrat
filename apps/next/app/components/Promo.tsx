"use client";

import { getNumberValue, type Workout } from "@gymrat/api";
import { useField, useForm } from "@shopify/react-form";
import { addDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CreateWorkout } from "../dashboard/components/CreateWorkout";
import { WorkoutRow } from "../dashboard/components/Workouts";

type PromoWorkout = Omit<Workout, "topScore">;

export function Promo() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [output, setOutput] = useState<PromoWorkout[]>([]);
  const [topScore, setTopScore] = useState<number>(90);
  const [today] = useState(new Date());
  const [input] = useState([
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
  ]);
  useEffect(() => {
    const interval = setInterval(() => {
      const workout = input.shift();
      if (workout) {
        setTopScore(workout.numberValue);
        setOutput((workouts) => [workout, ...workouts]);
      } else {
        clearInterval(interval);
      }
    }, 430);
    return () => clearInterval(interval);
  });

  const workouts = output.map((workout) => ({ ...workout, topScore }));

  const {
    submit,
    fields: { description, value },
  } = useForm({
    fields: {
      description: useField({
        description: "Back Squat 3x",
        id: null,
        topScore: 110,
      }),
      value: useField("110 kg"),
    },
    async onSubmit(values) {
      setHasInteracted(true);
      setTopScore((oldTopScore) => {
        const newTopScore = getNumberValue(values.value) ?? 0;
        return newTopScore > oldTopScore ? newTopScore : oldTopScore;
      });
      setOutput((workouts) => [
        {
          id: Math.random().toString(),
          value: values.value,
          numberValue: getNumberValue(values.value),
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
        className="mb-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <CreateWorkout
          workouts={workouts}
          isLoading={false}
          description={description}
          value={value}
        />
      </form>
      {workouts.length > 0 ? (
        <div className="flex flex-col gap-1 py-4">
          {workouts.map((workout, i) => (
            <div
              key={workout.id}
              className="data-active:bg-neutral-800 -mx-2 p-2 rounded-md group"
              data-headlessui-state={i === 0 ? "active" : ""}
            >
              <WorkoutRow workout={workout} editable={false} />
            </div>
          ))}
        </div>
      ) : null}
      <AnimatePresence>
        {hasInteracted && (
          <motion.div
            layout
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -10 }}
            className="text-center py-2 px-3  bg-teal-600/20 text-teal-600 font-medium my-8 rounded-md"
          >
            This is only a demo - Sign up to save your workouts
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
