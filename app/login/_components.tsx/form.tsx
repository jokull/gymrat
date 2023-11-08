"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useFormState } from "react-dom";

import { Primary } from "~/components/button-";
import { Input } from "~/components/input-";
import { login } from "~/db/actions";

export function Form(props: { action: typeof login }) {
  const [message, action] = useFormState(props.action, null);

  return (
    <form className="mb-4 flex flex-col gap-4" action={action}>
      <Input
        type="email"
        name="email"
        autoComplete="username"
        autoCorrect="off"
        placeholder="Your email address"
      />
      <Input
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="Your password"
      />
      <Primary>Submit</Primary>
      <AnimatePresence>
        {message && (
          <motion.div
            layout
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -10 }}
            className="my-8 rounded-md bg-red-600/20 px-3 py-2 text-center font-medium text-red-500"
          >
            <p>{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
