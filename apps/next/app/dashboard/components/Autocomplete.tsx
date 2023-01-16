import { type Workout } from "@gymrat/api";
import classNames from "classnames";
import {
  useCombobox,
  UseComboboxState,
  UseComboboxStateChangeOptions,
} from "downshift";
import Fuse from "fuse.js";
import { useCallback, useState } from "react";

import { Input } from "@/components/Input";

export type Item = {
  id: string;
} & Pick<Workout, "description" | "minScore" | "maxScore">;

function compareDescriptions(a: string, b: string) {
  return a.toLocaleLowerCase().trim() === b.toLocaleLowerCase().trim();
}

export default function Autocomplete({
  items: sourceItems,
  value,
  onChange,
}: {
  items: readonly Item[];
  value: Item;
  onChange: (value: Item) => void;
}) {
  const [items, setItems] = useState([...sourceItems]);

  const stateReducer = useCallback(
    (
      state: UseComboboxState<Item>,
      actionAndChanges: UseComboboxStateChangeOptions<Item>
    ) => {
      const { type, changes } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.InputChange:
        case useCombobox.stateChangeTypes.InputBlur:
          const matchedItem =
            sourceItems.find((item) =>
              compareDescriptions(changes.inputValue ?? "", item.description)
            ) ??
            ({
              id: "",
              description: changes.inputValue ?? "",
              maxScore: -1,
              minScore: -1,
            } satisfies Item);
          return {
            ...changes,
            inputValue: matchedItem.description,
            selectedItem: matchedItem,
          };
        default:
          return changes; // otherwise business as usual.
      }
    },
    []
  );

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    initialInputValue: value.description,
    items,
    itemToString(item) {
      return item ? item.description : "";
    },
    onSelectedItemChange: (changes) => {
      if (changes.selectedItem) {
        onChange(changes.selectedItem);
      }
    },
    onInputValueChange: ({ inputValue }) => {
      setItems(
        (inputValue?.trim().length ?? 0) > 0
          ? new Fuse(sourceItems, {
              keys: ["description"],
              findAllMatches: true,
              includeScore: true,
            })
              .search(inputValue ?? "")
              .map(({ item }) => item)
          : [...sourceItems]
      );
    },
    stateReducer,
  });

  return (
    <div className="relative inline-flex flex-col w-full">
      <label className="block text-sm font-medium text-gray-400 text-left leading-6">
        Workout / Lift
      </label>
      <Input
        className="w-full py-1.5 px-3 bg-transparent border border-neutral-600 rounded-md placeholder:text-neutral-700"
        autoFocus
        {...getInputProps()}
      />
      <div {...getMenuProps()}>
        {isOpen ? (
          <div className="w-full z-10 shadow-lg border-2 border-neutral-400 bg-neutral-900 p-1 rounded-md mt-2 absolute top-14">
            {items.map((item, index) => (
              <li
                aria-selected={index === highlightedIndex ? "true" : "false"}
                className={classNames(
                  "aria-active:bg-neutral-600 aria-selected:bg-neutral-500 text-sm px-2 py-1 rounded-sm block cursor-pointer"
                )}
                key={`${item.id}`}
                {...getItemProps({
                  item,
                  index,
                })}
              >
                {item.description}
              </li>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
