import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { QueryWorkout } from "~/db/queries";
import { $createWorkout, $deleteWorkout, $getWorkouts, $updateWorkout } from "~/src/lib/workouts";
import { getNumberValue } from "~/utils/workouts";

const WORKOUTS_KEY = ["workouts"] as const;

export const workoutsQueryOptions = () =>
	queryOptions({
		queryKey: WORKOUTS_KEY,
		queryFn: ({ signal }) => $getWorkouts({ signal }),
	});

export function useWorkouts() {
	return useQuery(workoutsQueryOptions());
}

export function useCreateWorkout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: { description: string; value: string }) => {
			await $createWorkout({ data: input });
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
			await $deleteWorkout({ data: { id } });
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
			await $updateWorkout({ data: input });
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
