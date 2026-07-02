import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

import { Secondary } from "~/components/button-";
import { Input } from "~/components/input-";
import type { QueryWorkout } from "~/db/queries";
import { useUpdateWorkout } from "~/lib/use-workouts";
import { getNumberValue } from "~/utils/workouts";

export function EditValue({ workout }: { workout: QueryWorkout }) {
	const mutation = useUpdateWorkout();
	const [value, setValue] = useState(workout.value);

	const valueType: "empty" | "value" | "time" =
		value.trim() === "" ? "empty" : getNumberValue(value).isTime ? "time" : "value";
	const [debouncedValueType] = useDebounceValue(valueType, 500);

	const dirty = value.trim() !== "" && value !== workout.value;

	return (
		<Popover>
			<PopoverButton className="font-medium hover:underline">{workout.value}</PopoverButton>
			<PopoverPanel
				anchor="bottom start"
				className="z-50 rounded-md bg-slate-900 p-3 text-white shadow transition duration-200 ease-out data-[closed]:translate-y-1 data-[closed]:opacity-0"
			>
				{({ close }) => {
					const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
						e.preventDefault();
						if (!dirty) return;
						mutation.mutate({ id: workout.id, value });
						close();
					};

					return (
						<form onSubmit={handleSubmit} className="flex items-end gap-2">
							<label className="inline-flex min-w-0 flex-col">
								<AnimatePresence mode="popLayout">
									<motion.span
										className="block text-left text-sm font-medium leading-6 text-gray-400"
										layout
										transition={{ duration: 0.25 }}
										initial={{ opacity: 0, x: 24 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 24 }}
										key={debouncedValueType}
									>
										{debouncedValueType === "empty" ? "Time / Unit" : null}
										{debouncedValueType === "time" ? "Time" : null}
										{debouncedValueType === "value" ? "Weight / Reps" : null}
									</motion.span>
								</AnimatePresence>
								<Input
									autoFocus
									name="value"
									value={value}
									onChange={(event) => {
										setValue(event.target.value);
									}}
								/>
							</label>
							{dirty ? (
								<Secondary type="submit" disabled={mutation.isPending}>
									Save
								</Secondary>
							) : null}
						</form>
					);
				}}
			</PopoverPanel>
		</Popover>
	);
}
