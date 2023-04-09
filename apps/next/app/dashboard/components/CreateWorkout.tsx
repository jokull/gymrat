"use client";

import { type AppRouter, type Workout, getNumberValue } from "@gymrat/api";
import { useField, useForm } from "@shopify/react-form";
import { inferRouterOutputs } from "@trpc/server";
import { AnimatePresence, motion } from "framer-motion";
import superjson from "superjson";
import { useDebounce } from "usehooks-ts";

import { Primary } from "@/components/Button";
import { trpc } from "@/trpc/client";

import Autocomplete, { Item } from "./Autocomplete";

type RouterOutput = inferRouterOutputs<AppRouter>;

function getDescriptionItems(
  workouts: RouterOutput["workouts"]
): readonly Item[] {
  const choices: Item[] = [];
  workouts.forEach(({ description, maxScore, minScore }) => {
    if (
      !choices.find(
        (name) => name.id === description.toLocaleLowerCase().trim()
      )
    ) {
      choices.push({
        id: description.toLocaleLowerCase(),
        description: description,
        maxScore,
        minScore,
      });
    }
  });
  return choices;
}

function useWorkoutForm() {
  const utils = trpc.useContext();
  const create = trpc.createWorkout.useMutation();
  const form = useForm({
    fields: {
      description: useField<Item>({
        value: { description: "", id: "", minScore: -1, maxScore: -1 },
        validates: (value) =>
          value.description.trim() === ""
            ? "Name of workout or lift is required"
            : undefined,
      }),
      value: useField({
        value: "",
        validates: (value) =>
          value.trim() === "" ? "Value is required" : undefined,
      }),
    },
    async onSubmit(values) {
      const workout = await create.mutateAsync({
        date: new Date(),
        description: values.description.description,
        value: values.value,
      });
      utils.workouts.setData(undefined, (oldData) => [
        workout,
        ...(oldData ?? []),
      ]);
      void utils.workouts.invalidate();
      form.reset();
      return { status: "success" };
    },
  });
  return { form, create };
}

export function DataCreateWorkout({
  serializedWorkouts,
}: {
  serializedWorkouts: ReturnType<typeof superjson.serialize>;
}) {
  const workouts =
    superjson.deserialize<RouterOutput["workouts"]>(serializedWorkouts);
  const {
    form: {
      submit,
      fields: { description, value },
    },
    create: { isLoading },
  } = useWorkoutForm();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <CreateWorkout
        workouts={workouts}
        isLoading={isLoading}
        description={description}
        value={value}
      />
    </form>
  );
}

type WorkoutFields = ReturnType<typeof useWorkoutForm>["form"]["fields"];

export function CreateWorkout({
  workouts,
  description,
  value,
  isLoading,
  isPromo = false,
}: {
  workouts: Workout[];
  isLoading: boolean;
  isPromo?: boolean;
} & WorkoutFields) {
  const items = getDescriptionItems(workouts);
  const numberValue = getNumberValue(value.value);
  const valueType: "empty" | "value" | "time" =
    value.value.trim() === "" ? "empty" : numberValue.isTime ? "time" : "value";
  const debouncedValueType = useDebounce(valueType, 500);
  return (
    <fieldset
      className="flex flex-wrap gap-4 w-full items-end"
      disabled={isLoading}
    >
      <div className="grow-[5] basis-[180px]">
        <Autocomplete
          items={items}
          // Shouldn't be necessary but in production builds `value` is undefined
          value={description.value}
          onChange={(item) => {
            description.onChange(item);
          }}
        />
      </div>
      <div className="grow-[3] basis-[100px]">
        <label className="inline-flex flex-col min-w-0">
          <AnimatePresence mode="popLayout">
            <motion.span
              className="block text-sm font-medium text-gray-400 text-left leading-6"
              layout
              transition={{ duration: 0.25 }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              key={debouncedValueType}
            >
              {debouncedValueType === "empty" ? "Time / Unit" : null}
              {debouncedValueType === "time" ? "Time" : null}
              {debouncedValueType === "value" ? "Weight / Reps" : null}
            </motion.span>
          </AnimatePresence>
          <input
            className="w-full py-1.5 px-3 border border-neutral-600 bg-transparent rounded-md placeholder:text-neutral-700"
            value={value.value}
            onChange={value.onChange}
          />
        </label>
      </div>
      <div className="grow-[1] basis-[80px] relative">
        {isPromo ? (
          <>
            <div className="absolute z-10 -top-[5px] -right-[5px] w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
            <div className="absolute z-20 -top-1 -right-1 w-2 h-2 rounded-full bg-white" />
          </>
        ) : null}
        <Primary
          type="submit"
          className="w-full z-30"
          disabled={
            value.value.trim() === "" ||
            description.value.description.trim() === ""
          }
        >
          <span className="font-bold @container">
            <span className="@sm:hidden">Save</span>
            <span className="hidden @sm:inline">Record New Workout</span>
          </span>
        </Primary>
      </div>
    </fieldset>
  );
}
