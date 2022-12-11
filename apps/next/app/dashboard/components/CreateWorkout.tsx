"use client";

import { useField, useForm } from "@shopify/react-form";

import { Primary } from "@/components/Button";
import { trpc } from "@/trpc/client";
import { inferRouterOutputs } from "@trpc/server";
import { type Workout } from "api/db";
import { type AppRouter } from "api/router";
import Autocomplete, { Item } from "./Autocomplete";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Props = { workouts: RouterOutput["workouts"] };

function getDescriptionItems(
  workouts: RouterOutput["workouts"]
): readonly Item[] {
  let choices: Item[] = [];
  workouts.forEach(({ description, topScore }) => {
    if (
      !choices.find(
        (name) => name.id === description.toLocaleLowerCase().trim()
      )
    ) {
      choices.push({
        id: description.toLocaleLowerCase(),
        description: description,
        topScore,
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
        value: { description: "", id: null, topScore: 0 },
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
      utils.workouts.invalidate();
      form.reset();
      return { status: "success" };
    },
  });
  return { form, create };
}

export function DataCreateWorkout({ workouts }: Props) {
  const {
    form: {
      submit,
      fields: { description, value },
    },
    create: { isLoading },
  } = useWorkoutForm();
  return (
    <form onSubmit={submit}>
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
}: { workouts: Workout[]; isLoading: boolean } & WorkoutFields) {
  const items = getDescriptionItems(workouts);
  return (
    <fieldset
      className="flex flex-wrap gap-4 w-full items-end"
      disabled={isLoading}
    >
      <div className="grow-[5] basis-[180px]">
        <Autocomplete
          items={items}
          value={description.value}
          onChange={(item) => description.onChange(item)}
        />
      </div>
      <div className="grow-[3] basis-[100px]">
        <label className="inline-flex flex-col min-w-0">
          <span className="block text-sm font-medium text-gray-400 text-left leading-6">
            Value
          </span>
          <input
            className="w-full py-1.5 px-3 border border-neutral-600 bg-transparent rounded-md placeholder:text-neutral-700"
            value={value.value}
            onChange={value.onChange}
            placeholder="80 kg"
          />
        </label>
      </div>
      <div className="grow-[1] basis-[80px]">
        <Primary type="submit" className="w-full">
          <span className="font-bold @container">
            <span className="@sm:hidden">Save</span>
            <span className="hidden @sm:inline">Record New Workout</span>
          </span>
        </Primary>
      </div>
    </fieldset>
  );
}
