"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Primary } from "~/components/button-";
import { Input } from "~/components/input-";

export function Form() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    void fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    }).then(async (res) => {
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data: { error?: string } = await res.json();
        setMessage(data.error ?? "Login failed");
        setPending(false);
      }
    });
  };

  return (
    <form className="mb-4 flex flex-col gap-4" onSubmit={handleSubmit}>
      <fieldset disabled={pending}>
        <div className="flex flex-col gap-4">
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
        </div>
      </fieldset>
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
