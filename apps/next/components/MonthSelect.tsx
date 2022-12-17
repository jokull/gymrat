import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { format, isAfter } from "date-fns/esm";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
    <div className="flex items-center gap-3 w-full justify-between h-10">
      <button
        className="text-neutral-500 hover:text-neutral-700 hover:scale-110 transition-all px-2 py-1.5"
        onClick={(event) => {
          event.preventDefault();
          onPrevious();
        }}
      >
        <ArrowLeftIcon className="w-4 h-4" />
      </button>
      <div className="grow-1 whitespace-nowrap font-semibold h-full relative text-center text-sm flex items-center">
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
        className={classNames(
          "px-2 py-1.5 transition-all",
          "text-neutral-500 hover:text-neutral-700 hover:scale-110"
        )}
        onClick={(event) => {
          event.preventDefault();
          onNext();
        }}
      >
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
