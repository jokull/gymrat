import classNames from "classnames";

import { WorkoutRow } from "./components/Workouts";

function getSkeletonWorkout() {
  return {
    date: new Date(),
    description: "-",
    id: "",
    numberValue: 0,
    value: "",
    isTime: false,
    maxScore: -1,
    minScore: -1,
  };
}

function Bone({ className }: { className: string }) {
  return (
    <div
      className={classNames(
        className,
        "h-12 rounded-md bg-slate-200/10 animate-pulse"
      )}
    ></div>
  );
}

export default function Loading() {
  return (
    <>
      <div className="flex gap-2">
        <Bone className="grow-[3]" />
        <Bone className="grow-[1]" />
        <Bone className="grow-[1]" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from(Array(5).keys()).map((i) => (
          <div
            key={`empty-${i}`}
            className="p-2 rounded-md group bg-slate-200/10 animate-pulse"
            data-headlessui-state={i === 0 ? "active" : ""}
          >
            <div className="invisible">
              <WorkoutRow
                workout={getSkeletonWorkout()}
                editable={false}
                data-superjson
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
