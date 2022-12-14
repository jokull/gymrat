import { Combobox } from "@headlessui/react";
import { Fragment, useState } from "react";

import { type AppRouter, type Workout } from "@gymrat/api";
import { inferRouterOutputs } from "@trpc/server";
import classNames from "classnames";
type RouterOutput = inferRouterOutputs<AppRouter>;

import Fuse from "fuse.js";

export type Item = {
  id: string | null;
} & Pick<Workout, "description" | "minScore" | "maxScore">;

function Option({ item }: { item: Item }) {
  return (
    <Combobox.Option
      key={item.id}
      value={item}
      className={classNames(
        "data-active:bg-neutral-600 data-selected:bg-neutral-500 text-sm px-2 py-1 rounded-sm block cursor-pointer"
      )}
    >
      {item.description}
    </Combobox.Option>
  );
}

function compareItems(a: Item, b: Item) {
  return (
    a.description.toLocaleLowerCase().trim() ===
    b.description.toLocaleLowerCase().trim()
  );
}

export default function Autocomplete({
  items,
  value,
  onChange,
}: {
  items: readonly Item[];
  value: Item;
  onChange: (value: Item) => void;
}) {
  const [query, setQuery] = useState("");

  const filteredItems =
    query.trim().length > 0
      ? new Fuse(items, {
          keys: ["description"],
          findAllMatches: true,
          includeScore: true,
        })
          .search(query)
          .map(({ item }) => item)
      : items;

  return (
    <div className="relative inline-flex flex-col w-full">
      <Combobox
        value={value}
        onChange={onChange}
        as={Fragment}
        by={compareItems}
      >
        <label className="block text-sm font-medium text-gray-400 text-left leading-6">
          Workout / Lift
        </label>
        <Combobox.Input
          className="w-full py-1.5 px-3 bg-transparent border border-neutral-600 rounded-md placeholder:text-neutral-700"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(item: Item | undefined) => item?.description ?? ""}
          autoFocus
        />
        <Combobox.Options className="w-full z-10 shadow-lg border-2 border-neutral-400 bg-neutral-900 p-1 rounded-md mt-2 absolute top-14">
          {query.length > 0 && (
            <Option
              key={"new"}
              item={{
                id: null,
                description: query,
                minScore: -1,
                maxScore: -1,
              }}
            />
          )}
          {filteredItems.map((item) => (
            <Option key={item.id} item={item} />
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
}
