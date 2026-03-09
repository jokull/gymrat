"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

import { Primary } from "~/components/button-";
import { getNumberValue } from "~/utils/workouts";

import { Autocomplete, type Item } from "./auto-complete";

export function CreateWorkout({
  workoutDescriptions,
}: {
  workoutDescriptions: Item[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    void fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, value }),
    }).then(async (res) => {
      if (res.ok) {
        setDescription("");
        setValue("");
        router.refresh();
      } else {
        const data: { error?: string } = await res.json();
        setMessage(data.error ?? "Failed to create workout");
      }
      setPending(false);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <CreateWorkoutFieldset
        workoutDescriptions={workoutDescriptions}
        pending={pending}
        description={description}
        setDescription={setDescription}
        value={value}
        setValue={setValue}
      />
      {message}
    </form>
  );
}

export function CreateWorkoutFieldset({
  workoutDescriptions,
  isPromo = false,
  defaultDescription,
  defaultValue,
  pending = false,
  description: controlledDescription,
  setDescription: controlledSetDescription,
  value: controlledValue,
  setValue: controlledSetValue,
}: {
  workoutDescriptions: Item[];
  isPromo?: boolean;
  defaultDescription?: string;
  defaultValue?: string;
  pending?: boolean;
  description?: string;
  setDescription?: (v: string) => void;
  value?: string;
  setValue?: (v: string) => void;
}) {
  const [localDescription, localSetDescription] = useState(
    defaultDescription ?? "",
  );
  const [localValue, localSetValue] = useState(defaultValue ?? "");

  const description = controlledDescription ?? localDescription;
  const setDescription = controlledSetDescription ?? localSetDescription;
  const value = controlledValue ?? localValue;
  const setValue = controlledSetValue ?? localSetValue;

  const numberValue = getNumberValue(value);
  const valueType: "empty" | "value" | "time" =
    value.trim() === "" ? "empty" : numberValue.isTime ? "time" : "value";
  const [debouncedValueType] = useDebounceValue(valueType, 500);
  return (
    <fieldset
      className="flex w-full flex-wrap items-end gap-4"
      disabled={pending}
    >
      <input type="hidden" name="description" value={description} />
      <div className="grow-[5] basis-[180px]">
        <Autocomplete
          items={workoutDescriptions}
          value={{ description }}
          onChange={(item) => {
            setDescription(item.description);
          }}
        />
      </div>
      <div className="grow-[3] basis-[100px]">
        <label className="inline-flex min-w-0 flex-col">
          <AnimatePresence mode="popLayout">
            <motion.span
              className="block text-left text-sm font-medium leading-6 text-gray-400"
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
            className="w-full rounded-md border border-slate-600 bg-transparent px-3 py-1.5 placeholder:text-slate-700"
            name="value"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
            }}
          />
        </label>
      </div>
      <div className="relative grow-[1] basis-[80px]">
        {isPromo ? (
          <>
            <div className="absolute -right-[5px] -top-[5px] z-10 h-2.5 w-2.5 animate-ping rounded-full bg-pink-500" />
            <div className="absolute -right-1 -top-1 z-20 h-2 w-2 rounded-full bg-white" />
          </>
        ) : null}
        <Primary
          type="submit"
          className="z-30 -mt-1 w-full"
          disabled={value.trim() === "" || description.trim() === ""}
        >
          <span className="@container font-bold">
            <span className="@sm:hidden">Save</span>
            <span className="@sm:inline hidden">Record New Workout</span>
          </span>
        </Primary>
      </div>
    </fieldset>
  );
}
