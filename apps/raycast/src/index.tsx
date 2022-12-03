import {
  Action,
  ActionPanel,
  Alert,
  Color,
  confirmAlert,
  Form,
  getPreferenceValues,
  Icon,
  List,
  useNavigation,
} from "@raycast/api";

import Fuse from "fuse.js";
import superjson from "superjson";

import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";
import { z } from "zod";

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "api/router";

const workoutSchema = z.object({
  id: z.string(),
  date: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  description: z.string(),
  value: z.string(),
});

type Workout = z.infer<typeof workoutSchema>;
type FormWorkout = Omit<Workout, "id">;

function EditWorkoutForm({ workout, onSuccess }: { workout: Workout; onSuccess: (workout: FormWorkout) => void }) {
  const { pop } = useNavigation();
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Update Workout"
            onSubmit={(values) => {
              onSuccess({ date: values.date, description: values.description, value: values.value });
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.DatePicker id="date" type={Form.DatePicker.Type.Date} title="Date" defaultValue={workout.date} />
      <Form.TextField id="description" title="Workout / Lift" defaultValue={workout.description} />
      <Form.TextField id="value" title="Value" defaultValue={workout.value} />
    </Form>
  );
}

function CreateWorkoutForm({ onCreate }: { onCreate: (workout: FormWorkout) => void }) {
  const { pop } = useNavigation();
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Workout"
            onSubmit={(values) => {
              onCreate({ date: values.date, description: values.description, value: values.value });
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.DatePicker id="date" type={Form.DatePicker.Type.Date} title="Date" defaultValue={new Date()} />
      <Form.TextField id="description" title="Workout / Lift" />
      <Form.TextField id="value" title="Value" />
    </Form>
  );
}

function CreateWorkoutAction({ onCreate }: { onCreate: (workout: FormWorkout) => void }) {
  return (
    <Action.Push
      icon={Icon.Pencil}
      title="Create Workout"
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<CreateWorkoutForm onCreate={onCreate} />}
    />
  );
}

interface Preferences {
  apiKey: string;
}

export default function Command() {
  const { apiKey } = getPreferenceValues<Preferences>();
  const api = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `http://127.0.0.1:8787/trpc`,
        // url: `https://gymrat-api.solberg.workers.dev/trpc`,
        headers: { Authorization: apiKey },
      }),
    ],
  });

  const [searchText, setSearchText] = useState("");
  const { data, isLoading, revalidate } = useCachedPromise(async () => {
    return await api.workouts.query();
  }, []);

  const workouts = data ?? [];

  const filteredWorkouts =
    searchText.trim().length > 1
      ? new Fuse(workouts, {
          keys: ["description"],
          findAllMatches: true,
          includeScore: true,
        })
          .search(searchText)
          .map(({ item }) => item)
      : workouts;

  function handleCreate(values: FormWorkout) {
    api.createWorkout
      .mutate({
        value: values.value,
        description: values.description,
        date: values.date,
      })
      .then(() => {
        revalidate();
      });
  }

  return (
    <List
      filtering={false}
      onSearchTextChange={setSearchText}
      navigationTitle="Search Workouts"
      searchBarPlaceholder="Search your workout log"
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <CreateWorkoutAction onCreate={handleCreate} />
        </ActionPanel>
      }
    >
      {filteredWorkouts.map((workout) => (
        <List.Item
          key={workout.id}
          title={workout.description}
          subtitle={`${workout.value} at ${workout.date.toLocaleDateString(undefined, { dateStyle: "full" })}`}
          id={workout.id}
          icon={workout.numberValue === workout.topScore ? { source: Icon.Star, tintColor: Color.Yellow } : undefined}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <CreateWorkoutAction onCreate={handleCreate} />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action.Push
                  icon={Icon.Pencil}
                  title="Edit Workout"
                  shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  target={
                    <EditWorkoutForm
                      workout={workout}
                      onSuccess={(fields) => {
                        api.updateWorkout.mutate({ id: workout.id, fields }).then(() => {
                          revalidate();
                        });
                      }}
                    />
                  }
                />
                <Action
                  icon={Icon.Trash}
                  title="Delete Workout"
                  shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                  onAction={async () => {
                    if (
                      await confirmAlert({
                        title: "Delete this workout?",
                        icon: { source: Icon.Warning, tintColor: Color.Red },
                        primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
                      })
                    ) {
                      api.deleteWorkout.mutate(workout.id).then(() => {
                        revalidate();
                      });
                    }
                  }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
