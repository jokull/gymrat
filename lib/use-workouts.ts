"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { QueryWorkout } from "~/db/queries";
import { getNumberValue } from "~/utils/workouts";

export type SerializedWorkout = Omit<QueryWorkout, "date"> & { date: string };

function deserialize(w: SerializedWorkout): QueryWorkout {
	return { ...w, date: new Date(w.date) };
}

const WORKOUTS_KEY = ["workouts"] as const;

export function useWorkouts(initialData: QueryWorkout[]) {
	return useQuery<QueryWorkout[]>({
		queryKey: WORKOUTS_KEY,
		queryFn: async () => {
			const res = await fetch("/api/workouts");
			const data: SerializedWorkout[] = await res.json();
			return data.map(deserialize);
		},
		initialData,
	});
}

export function useCreateWorkout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: { description: string; value: string }) => {
			const res = await fetch("/api/workouts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const data: { error?: string } = await res.json();
				throw new Error(data.error ?? "Failed to create workout");
			}
		},
		onMutate: async (input) => {
			await queryClient.cancelQueries({ queryKey: WORKOUTS_KEY });
			const previous = queryClient.getQueryData<QueryWorkout[]>(WORKOUTS_KEY);

			const { value: numberValue, isTime } = getNumberValue(input.value);
			const optimistic: QueryWorkout = {
				id: crypto.randomUUID(),
				date: new Date(),
				description: input.description,
				comment: null,
				isTime,
				numberValue,
				value: input.value,
				minScore: numberValue,
				maxScore: numberValue,
			};

			queryClient.setQueryData<QueryWorkout[]>(WORKOUTS_KEY, (old) =>
				old ? [optimistic, ...old] : [optimistic],
			);

			return { previous };
		},
		onError: (_err, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(WORKOUTS_KEY, context.previous);
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: WORKOUTS_KEY });
		},
	});
}

export function useDeleteWorkout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const data: { error?: string } = await res.json();
				throw new Error(data.error ?? "Failed to delete workout");
			}
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: WORKOUTS_KEY });
			const previous = queryClient.getQueryData<QueryWorkout[]>(WORKOUTS_KEY);

			queryClient.setQueryData<QueryWorkout[]>(WORKOUTS_KEY, (old) =>
				old ? old.filter((w) => w.id !== id) : [],
			);

			return { previous };
		},
		onError: (_err, _id, context) => {
			if (context?.previous) {
				queryClient.setQueryData(WORKOUTS_KEY, context.previous);
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: WORKOUTS_KEY });
		},
	});
}

export function useUpdateWorkout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			id: string;
			date?: string;
			comment?: string;
			value?: string;
		}) => {
			const { id, ...body } = input;
			const res = await fetch(`/api/workouts/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const data: { error?: string } = await res.json();
				throw new Error(data.error ?? "Failed to update workout");
			}
		},
		onMutate: async (input) => {
			await queryClient.cancelQueries({ queryKey: WORKOUTS_KEY });
			const previous = queryClient.getQueryData<QueryWorkout[]>(WORKOUTS_KEY);

			queryClient.setQueryData<QueryWorkout[]>(WORKOUTS_KEY, (old) =>
				old
					? old.map((w) => {
							if (w.id !== input.id) return w;
							return {
								...w,
								...(input.date ? { date: new Date(input.date) } : undefined),
								...(typeof input.comment === "string"
									? { comment: input.comment.trim() || null }
									: undefined),
								...(typeof input.value === "string"
									? (() => {
											const { value: numberValue, isTime } = getNumberValue(
												input.value,
											);
											return { value: input.value, numberValue, isTime };
										})()
									: undefined),
							};
						})
					: [],
			);

			return { previous };
		},
		onError: (_err, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(WORKOUTS_KEY, context.previous);
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: WORKOUTS_KEY });
		},
	});
}
