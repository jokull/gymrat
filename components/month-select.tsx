import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { format, isAfter } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "~/utils/classnames";

export function MonthSelect({
  value,
  onNext,
  onPrevious,
}: {
  value: Date;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const ref = useRef<Date>(value);
  const [direction, setDirection] = useState<-1 | 1 | 0>(0);

  useEffect(() => {
    const direction = isAfter(ref.current, value) ? -1 : 1;
    setDirection(() => direction);
    ref.current = value;
  }, [value]);

  return (
    <div className="flex h-10 w-full items-center justify-between gap-3">
      <button
        className="px-2 py-1.5 text-slate-500 transition-all hover:scale-110 hover:text-slate-700"
        onClick={(event) => {
          event.preventDefault();
          onPrevious();
        }}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>
      <div className="grow-1 relative flex h-full items-center whitespace-nowrap text-center text-sm font-semibold">
        <AnimatePresence mode="wait">
          <motion.div
            key={ref.current.getMonth()}
            initial={{
              opacity: direction === 0 ? 1 : 0,
              x: 60 * direction,
            }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: "anticipate" }}
          >
            {format(ref.current, "MMMM y")}
          </motion.div>
        </AnimatePresence>
      </div>
      <button
        className={cn(
          "px-2 py-1.5 transition-all",
          "text-slate-500 hover:scale-110 hover:text-slate-700",
        )}
        onClick={(event) => {
          event.preventDefault();
          onNext();
        }}
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
