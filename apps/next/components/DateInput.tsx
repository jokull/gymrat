import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import classNames from "classnames";
import {
  addDays,
  endOfMonth,
  format,
  isAfter,
  isEqual,
  isToday,
  startOfMonth,
} from "date-fns";
import { ReactNode } from "react";

import { useCalendar } from "@/utils/use-calendar";

import { MonthSelect } from "./MonthSelect";

export function DayGrid({
  calendar,
  onSelect,
  isSelected,
  inRange,
  viewing,
  selected,
  maxDate,
}: {
  calendar: Date[][];
  onSelect: (day: Date) => void;
  isSelected: (date: Date) => boolean;
  inRange: (date: Date, min: Date, max: Date) => boolean;
  viewing: Date;
  selected: Date[];
  maxDate?: Date;
}) {
  return (
    <>
      <div className="grid grid-cols-7 gap-1 place-items-center my-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-semibold text-xs text-neutral-500">
            {day.slice(0, 1)}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1" aria-label="Calendar grid">
        {calendar.map((week) => (
          <div
            key={week[0]!.toString()}
            className="grid grid-cols-7 gap-1 justify-between"
          >
            {week.map((day) => {
              const onPick = () => {
                onSelect(day);
              };

              const rangeSelected = selected.length > 1;
              const firstSelected = selected[0]!;
              const lastSelected = selected[selected.length - 1]!;
              const isStart =
                rangeSelected && isSelected(day) && isEqual(day, firstSelected);
              const isEnd =
                rangeSelected && isSelected(day) && isEqual(day, lastSelected);
              const isWithinRange =
                rangeSelected &&
                isSelected(day) &&
                !isEqual(day, firstSelected) &&
                !isEqual(day, lastSelected);

              return (
                <div
                  key={day.toString()}
                  className={classNames(
                    "relative h-7 w-7",
                    "flex items-center justify-center",
                    isWithinRange &&
                      "border-t border-b bg-secondary-200 border-secondary-300"
                  )}
                >
                  {isStart && (
                    <div
                      className="opacity-30 rounded-l-full absolute inset-y-0 left-1.5 right-0
                    bg-secondary-200 border-secondary-500 border-t border-b border-l"
                    />
                  )}
                  {isEnd && (
                    <div
                      className="opacity-30 rounded-r-full absolute inset-y-0 left-0 right-1.5
                    bg-secondary-200 border-secondary-500 border-t border-b border-r"
                    />
                  )}
                  <button
                    onClick={onPick}
                    role="button"
                    disabled={maxDate && isAfter(day, maxDate)}
                    tabIndex={0}
                    className={classNames(
                      "z-30 transform-gpu transition-colors translate-x-0 w-7 h-7",
                      "rounded-sm flex items-center justify-center text-sm",
                      "disabled:line-through border",
                      isSelected(day)
                        ? "text-white bg-pink-500 hover:bg-pink-600"
                        : "hover:bg-pink-400 hover:text-white disabled:text-neutral-700 disabled:bg-transparent",
                      isToday(day)
                        ? "border-neutral-300"
                        : "border-transparent",
                      !inRange(day, startOfMonth(viewing), endOfMonth(viewing))
                        ? "text-neutral-600"
                        : "text-neutral-300"
                    )}
                  >
                    <span className="mt-0.5">{format(day, "dd")}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

export default function DateInput({
  initial,
  onChange,
  children,
}: {
  initial: Date;
  onChange: (value: Date) => void;
  children: ReactNode;
}) {
  const {
    selected,
    calendar,
    inRange,
    isSelected,
    viewing,
    select,
    viewNextMonth,
    viewPreviousMonth,
    setViewing,
  } = useCalendar({
    selected: [initial],
    viewing: initial ?? undefined,
  });

  const onSelect = (day: Date) => {
    select(day, true);
    setViewing(day);
    onChange(day);
  };

  return (
    <Popover>
      <Float
        placement="bottom-end"
        offset={5}
        shift={6}
        portal
        enter="transition duration-200 ease-out"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-150 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <Popover.Button className="hover:underline">{children}</Popover.Button>
        <Popover.Panel className="bg-neutral-900 rounded-md text-white p-3 shadow">
          {({ close }) => (
            <div>
              <MonthSelect
                value={viewing}
                onNext={viewNextMonth}
                onPrevious={viewPreviousMonth}
              />
              <DayGrid
                calendar={calendar}
                inRange={inRange}
                isSelected={isSelected}
                onSelect={(day) => {
                  onSelect(day);
                  close();
                }}
                selected={selected}
                viewing={viewing}
                maxDate={addDays(new Date(), 1)}
              />
            </div>
          )}
        </Popover.Panel>
      </Float>
    </Popover>
  );
}
