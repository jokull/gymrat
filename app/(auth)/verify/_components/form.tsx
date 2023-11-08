"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useFormState } from "react-dom";

import { Primary } from "~/components/button-";
import { Input } from "~/components/input-";
import { type setPassword } from "~/db/actions";

export function Form({
  action,
  email,
  token,
}: {
  action: typeof setPassword;
  email: string;
  token: string;
}) {
  const [message, verify] = useFormState(action, null);

  return (
    <form className="mb-4 flex flex-col gap-4" action={verify}>
      <input type="hidden" value={token} name="token" />
      <Input
        type="email"
        readOnly
        value={email}
        name="username"
        autoCorrect="off"
      />
      <Input
        type="password"
        autoComplete="new-password"
        name="new-password"
        placeholder="Choose a new password"
        autoFocus
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
