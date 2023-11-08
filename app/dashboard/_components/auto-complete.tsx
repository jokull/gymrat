import {
  useCombobox,
  UseComboboxState,
  UseComboboxStateChangeOptions,
} from "downshift";
import Fuse from "fuse.js";
import { useCallback, useState } from "react";

import { Input } from "~/components/Input";
import { cn } from "~/utils/classnames";

export type Item = { description: string };

function compareDescriptions(a: string, b: string) {
  return a.toLocaleLowerCase().trim() === b.toLocaleLowerCase().trim();
}

export function Autocomplete({
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
      actionAndChanges: UseComboboxStateChangeOptions<Item>,
    ) => {
      const { type, changes } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.InputChange:
        case useCombobox.stateChangeTypes.InputBlur:
          const matchedItem =
            sourceItems.find((item) =>
              compareDescriptions(changes.inputValue ?? "", item.description),
            ) ??
            ({
              description: changes.inputValue ?? "",
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
    [],
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
          : [...sourceItems],
      );
    },
    stateReducer,
  });

  return (
    <div className="relative inline-flex w-full flex-col">
      <label className="block text-left text-sm font-medium leading-6 text-gray-400">
        Workout / Lift
      </label>
      <Input
        className="w-full rounded-md border border-neutral-600 bg-transparent px-3 py-1.5 placeholder:text-neutral-700"
        {...getInputProps()}
      />
      <div {...getMenuProps()}>
        {isOpen ? (
          <div className="absolute top-14 z-10 mt-2 w-full rounded-md border-2 border-neutral-400 bg-neutral-900 p-1 shadow-lg">
            {items.map((item, index) => (
              <li
                className={cn(
                  "aria-active:bg-neutral-600 block cursor-pointer rounded-sm px-2 py-1 text-sm aria-selected:bg-neutral-500",
                )}
                key={item.description}
                {...getItemProps({
                  item,
                  index,
                  "aria-selected":
                    index === highlightedIndex ? "true" : "false",
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
