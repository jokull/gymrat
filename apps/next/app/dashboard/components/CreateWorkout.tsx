"use client";

import { useField, useForm } from "@shopify/react-form";

import { trpc } from "@/trpc/client";
import { inferRouterOutputs } from "@trpc/server";
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

export function CreateWorkout({ workouts }: Props) {
  const utils = trpc.useContext();
  const create = trpc.createWorkout.useMutation();
  const items = getDescriptionItems(workouts);

  const {
    fields: { description, value },
    submit,
    ...form
  } = useForm({
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
      form.reset();
      return { status: "success" };
    },
  });

  return (
    <form onSubmit={submit}>
      <fieldset
        className="flex gap-4 w-full items-end"
        disabled={create.isLoading}
      >
        <Autocomplete
          items={items}
          value={description.value}
          onChange={(item) => description.onChange(item)}
        />
        <label className="inline-flex flex-col w-32">
          <span className="block text-sm font-medium text-gray-500 text-left leading-6">
            Value
          </span>
          <input
            className="py-1 px-3 bg-neutral-900 border-2 border-neutral-400 focus:border-neutral-200 rounded-md shadow-sm outline-none placeholder:text-neutral-700"
            value={value.value}
            onChange={value.onChange}
            placeholder="80 kg"
          />
        </label>
        <button
          type="submit"
          className="py-1.5 px-3 font-bold bg-neutral-200 text-neutral-900 rounded-md shadow-sm"
        >
          Save
        </button>
      </fieldset>
    </form>
  );
}
