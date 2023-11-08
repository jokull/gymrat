"use server";

import { and, eq } from "drizzle-orm";
import { sealData } from "iron-session/edge";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDrizzle } from "~/db/client";
import { normalizeEmail, verifyPassword } from "~/db/utils";
import { user, workout } from "~/schema";
import { getLoginContext } from "~/utils/session";
import { getNumberValue } from "~/utils/workouts";

const loginForm = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createWorkoutForm = z.object({
  description: z.string().min(1),
  value: z.string(),
});

const deleteWorkoutForm = z.object({
  id: z.string().uuid(),
});

async function setAuthCookie(email: string) {
  cookies().set(
    "__session",
    await sealData(
      { email: email },
      { password: process.env.SECRET_KEY ?? "", ttl: 60 * 60 * 24 * 365 }, // 1 year
    ),
    {
      maxAge: 2592000,
      sameSite: "strict",
      path: "/",
      secure: true,
      httpOnly: true,
    },
  );
}

export async function login(prevState: any, formData: FormData) {
  const result = loginForm.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return "Email and password required";
  }

  const form = result.data;

  const email = normalizeEmail(form.email);

  const db = getDrizzle();
  const dbUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (!dbUser) {
    return "No user found";
  }

  if (!verifyPassword(form.password, dbUser.hashedPassword)) {
    return "This password is incorrect";
  }

  await setAuthCookie(email);

  redirect("/dashboard");
}

export async function createWorkout(prevState: any, formData: FormData) {
  const { dbUser, db } = await getLoginContext();

  if (!dbUser) {
    redirect("/login");
  }

  const result = createWorkoutForm.safeParse({
    description: formData.get("description"),
    value: formData.get("value"),
  });

  if (!result.success) {
    return "Description and value required";
  }

  const form = result.data;

  const { value: numberValue, isTime } = getNumberValue(form.value);

  await db
    .insert(workout)
    .values({
      userId: dbUser.id,
      date: new Date(),
      id: crypto.randomUUID(),
      numberValue,
      value: form.value,
      isTime,
      description: form.description,
    })
    .run();

  revalidatePath("/dashboard");
}

export async function deleteWorkout(prevState: any, formData: FormData) {
  const { dbUser, db } = await getLoginContext();

  if (!dbUser) {
    redirect("/login");
  }

  const result = deleteWorkoutForm.safeParse({
    id: formData.get("id"),
  });

  if (!result.success) {
    return "Description and value required";
  }

  const { id } = result.data;

  await db
    .delete(workout)
    .where(and(eq(workout.userId, dbUser.id), eq(workout.id, id)))
    .run();

  revalidatePath("/dashboard");
}
