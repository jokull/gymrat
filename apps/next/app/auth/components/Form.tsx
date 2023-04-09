"use client";

import { useField, useForm } from "@shopify/react-form";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams as useNextSearchParams } from "next/navigation";
import { useSearchParams } from "utils/use-search-params";
import { z } from "zod";

import { Primary } from "@/components/Button";
import { Input } from "@/components/Input";
import { trpc } from "@/trpc/client";

function SendVerifyForm() {
  const sendVerifyEmail = trpc.sendVerifyEmail.useMutation();
  const { fields, submit, dirty } = useForm({
    fields: { email: useField("") },
    onSubmit: async (cleanValues) => {
      await sendVerifyEmail.mutateAsync(cleanValues);
      return { status: "success" };
    },
  });
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="flex flex-col gap-4 mb-4"
      >
        <Input
          type="email"
          value={fields.email.value}
          onChange={fields.email.onChange}
          name="username"
          autoComplete="username"
          autoFocus
          autoCorrect="off"
          placeholder="Your email address"
        />
        <Primary disabled={!dirty}>Submit</Primary>
      </form>

      <AnimatePresence>
        {sendVerifyEmail.isSuccess && (
          <motion.div
            layout
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -10 }}
            className="text-center py-2 px-3  bg-teal-600/20 text-teal-600 font-medium my-8 rounded-md"
          >
            <p>Verification link was sent to {fields.email.value}</p>
            <p className="text-xs mt-1">
              Check spam folder if email hasn't arrived within the minute
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LoginForm() {
  const searchParams = useNextSearchParams();
  const login = trpc.login.useMutation();

  const { fields, submit, dirty, submitErrors } = useForm({
    fields: { email: useField(""), password: useField("") },
    makeCleanAfterSubmit: true,
    onSubmit: async (cleanValues) => {
      const response = await login.mutateAsync(cleanValues);
      if (response.error) {
        return { status: "fail", errors: [{ message: response.error }] };
      }
      window.location.href = new URL(
        searchParams?.get("next") ?? "/dashboard",
        window.location.href
      ).toString();
      return { status: "success" };
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-4 mb-4"
    >
      <Input
        type="email"
        value={fields.email.value}
        onChange={fields.email.onChange}
        name="username"
        autoComplete="username"
        autoCorrect="off"
        placeholder="Your email address"
      />
      <Input
        type="password"
        name="current-password"
        autoComplete="current-password"
        value={fields.password.value}
        onChange={fields.password.onChange}
        placeholder="Your password"
      />
      <Primary disabled={!dirty}>Login</Primary>

      <AnimatePresence>
        {submitErrors.length > 0 && (
          <motion.div
            layout
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -10 }}
            className="text-center py-2 px-3 bg-red-600/20 text-red-500 font-medium my-8 rounded-md"
          >
            <p>{submitErrors.map(({ message }) => message).join(", ")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export function Form() {
  const [{ screen }, setSearchParam] = useSearchParams({
    screen: z.enum(["login", "signup", "forgotPassword"]).default("signup"),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-baseline">
        <h2 className="text-xl font-medium">
          {screen === "login" ? "Login" : null}
          {screen === "signup" ? "Create new account" : null}
          {screen === "forgotPassword" ? "Recover password" : null}
        </h2>
        {screen !== "forgotPassword" ? (
          <p className="text-sm text-neutral-600">
            <button
              className="underline text-neutral-50"
              onClick={() => {
                setSearchParam("screen", "forgotPassword");
              }}
            >
              Forgot password
            </button>
          </p>
        ) : null}
      </div>

      {screen === "forgotPassword" ? (
        <>
          <SendVerifyForm />
          <p className="text-sm text-neutral-400">
            Don't have an account yet?{" "}
            <button
              className="underline text-neutral-50"
              onClick={() => {
                setSearchParam("screen", "signup");
              }}
            >
              Sign up
            </button>
          </p>
        </>
      ) : null}

      {screen === "signup" ? (
        <>
          <SendVerifyForm />
          <p className="text-sm text-neutral-400">
            Already have an account?{" "}
            <button
              className="underline text-neutral-50"
              onClick={() => {
                setSearchParam("screen", "login");
              }}
            >
              Log in
            </button>
          </p>
        </>
      ) : null}

      {screen === "login" ? (
        <>
          <LoginForm />
          <p className="text-sm text-neutral-400">
            Don't have an account yet?{" "}
            <button
              className="underline text-neutral-50"
              onClick={() => {
                setSearchParam("screen", "signup");
              }}
            >
              Sign up
            </button>
          </p>
        </>
      ) : null}
    </div>
  );
}
