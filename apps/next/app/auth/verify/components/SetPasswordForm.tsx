"use client";

import { useField, useForm } from "@shopify/react-form";

import { Primary } from "@/components/Button";
import { Input } from "@/components/Input";
import { trpc } from "@/trpc/client";

export function SetPasswordForm({ token }: { token?: string }) {
  const setPassword = trpc.setPassword.useMutation();
  const email = trpc.unsealToken.useQuery(token ?? "");
  const { fields, submit, dirty } = useForm({
    fields: { password: useField("") },
    onSubmit: async (cleanValues) => {
      await setPassword.mutateAsync({
        ...cleanValues,
        token: token ?? "",
      });
      return { status: "success" };
    },
  });
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-4"
    >
      <Input
        type="email"
        readOnly
        value={email.data?.email}
        name="username"
        autoComplete="username"
        autoFocus
        autoCorrect="off"
      />
      <Input
        type="password"
        autoComplete="new-password"
        value={fields.password.value}
        onChange={fields.password.onChange}
      />
      <Primary disabled={!dirty}>Submit</Primary>
    </form>
  );
}
