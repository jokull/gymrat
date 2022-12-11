"use client";

import { useField, useForm } from "@shopify/react-form";
import { type Workout } from "api/db";
import { addDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CreateWorkout } from "../dashboard/components/CreateWorkout";
import { Workouts } from "../dashboard/components/Workouts";

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
        setOutput((workouts) => [...workouts, workout]);
      } else {
        clearInterval(interval);
      }
    }, 230);
    return () => clearInterval(interval);
  });

  const workouts = output.map((workout) => ({ ...workout, topScore }));

  const {
    submit,
    fields: { description, value },
  } = useForm({
    fields: {
      description: useField({ description: "", id: null, topScore: 0 }),
      value: useField(""),
    },
    async onSubmit(values) {
      setHasInteracted(true);
      setOutput((workouts) => [
        {
          id: Math.random().toString(),
          value: values.value,
          numberValue: 0,
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
      <Workouts
        workout={workouts[-1]}
        setWorkout={() => undefined}
        workouts={workouts}
        editable={false}
      />
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
