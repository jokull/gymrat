import { Float } from "@headlessui-float/react";
import { Popover } from "@headlessui/react";
import {
  addDays,
  endOfMonth,
  format,
  isAfter,
  isEqual,
  isToday,
  startOfMonth,
} from "date-fns";
import { ReactNode, useEffect, useState } from "react";

import { cn } from "~/utils/classnames";
import { useCalendar } from "~/utils/use-calendar";

import { MonthSelect } from "./month-select";

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
      <div className="my-3 grid grid-cols-7 place-items-center gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-xs font-semibold text-slate-500">
            {day.slice(0, 1)}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1" aria-label="Calendar grid">
        {calendar.map((week) => (
          <div
            key={week[0]?.toString()}
            className="grid grid-cols-7 justify-between gap-1"
          >
            {week.map((day) => {
              const onPick = () => {
                onSelect(day);
              };

              const rangeSelected = selected.length > 1;
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const firstSelected = selected[0]!;
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
                  className={cn(
                    "relative h-7 w-7",
                    "flex items-center justify-center",
                    isWithinRange &&
                      "bg-secondary-200 border-secondary-300 border-b border-t",
                  )}
                >
                  {isStart && (
                    <div
                      className="bg-secondary-200 border-secondary-500 absolute inset-y-0 left-1.5 right-0
                    rounded-l-full border-b border-l border-t opacity-30"
                    />
                  )}
                  {isEnd && (
                    <div
                      className="bg-secondary-200 border-secondary-500 absolute inset-y-0 left-0 right-1.5
                    rounded-r-full border-b border-r border-t opacity-30"
                    />
                  )}
                  <button
                    onClick={onPick}
                    role="button"
                    disabled={maxDate && isAfter(day, maxDate)}
                    tabIndex={0}
                    className={cn(
                      "z-30 h-7 w-7 translate-x-0 transform-gpu transition-colors",
                      "flex items-center justify-center rounded-sm text-sm",
                      "border disabled:line-through",
                      isSelected(day)
                        ? "bg-pink-500 text-white hover:bg-pink-600"
                        : "hover:bg-pink-400 hover:text-white disabled:bg-transparent disabled:text-slate-700",
                      isToday(day) ? "border-slate-300" : "border-transparent",
                      !inRange(day, startOfMonth(viewing), endOfMonth(viewing))
                        ? "text-slate-600"
                        : "text-slate-300",
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

export function DateInput({
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
    viewing: initial,
  });

  const onSelect = (day: Date) => {
    select(day, true);
    setViewing(day);
    onChange(day);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Only mount on client side - these libraries are not ready for `/app` it seems
    return <>{children}</>;
  }

  return (
    <Popover>
      <Float
        placement="top-end"
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
        <Popover.Panel className="rounded-md bg-slate-900 p-3 text-white shadow">
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
