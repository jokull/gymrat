import {
  useCombobox,
  UseComboboxState,
  UseComboboxStateChangeOptions,
} from "downshift";
import Fuse from "fuse.js";
import { useCallback, useState } from "react";

import { Input } from "~/components/input-";
import { cn } from "~/utils/classnames";

export interface Item {
  description: string;
}

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
    [sourceItems],
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
        className="w-full rounded-md border border-slate-600 bg-transparent px-3 py-1.5 placeholder:text-slate-700"
        {...getInputProps()}
      />
      <div {...getMenuProps()}>
        <div
          className={cn(
            "absolute top-14 z-10 mt-2 w-full rounded-md bg-slate-800 p-1 shadow-[5px_5px_25px_5px_rgba(0,0,0,0.4)] transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0",
          )}
        >
          {items.map((item, index) => (
            <li
              className={cn(
                "aria-active:bg-slate-800 block cursor-pointer rounded-sm px-2 py-1 text-sm aria-selected:bg-slate-700",
              )}
              key={item.description}
              {...getItemProps({
                item,
                index,
                "aria-selected": index === highlightedIndex ? "true" : "false",
              })}
            >
              {item.description}
            </li>
          ))}
        </div>
      </div>
    </div>
  );
}
