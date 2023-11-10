"use server";

import { and, eq } from "drizzle-orm";
import { sealData } from "iron-session/edge";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDrizzle } from "~/db/client";
import { hashPassword, normalizeEmail, verifyPassword } from "~/db/passwords";
import { user, workout } from "~/schema";
import { unsealVerificationToken } from "~/utils/auth";
import { getLoginContext } from "~/utils/session";
import { getNumberValue } from "~/utils/workouts";

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

export async function sendVerificationEmail(
  prevState: unknown,
  formData: FormData,
) {
  const result = z
    .object({
      email: z.string().email(),
    })
    .safeParse({
      email: formData.get("email"),
    });

  if (!result.success) {
    return "Email required";
  }

  const form = result.data;

  const email = normalizeEmail(form.email);

  const token = await sealData(email, {
    password: process.env.SECRET_KEY ?? "",
    ttl: 15 * 60,
  });

  const contentValue = `https://${process.env.HOST}/verify?token=${token}`;

  await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: {
        email: "no-reply@gymrat.is",
        name: "Gymrat",
      },
      subject: "Verify email",
      content: [
        {
          type: "text/plain",
          value: contentValue,
        },
      ],
    }),
  });
}

export async function setPassword(prevState: unknown, formData: FormData) {
  const result = z
    .object({ password: z.string().min(6), token: z.string() })
    .safeParse({
      password: formData.get("password"),
    });

  if (!result.success) {
    return "Password should be at least 6 characters";
  }

  const form = result.data;

  const email = await unsealVerificationToken(form.token);

  const db = getDrizzle();
  let dbUser = await db.query.user.findFirst({
    where: eq(user.email, normalizeEmail(email)),
  });

  if (!dbUser) {
    dbUser = await db
      .insert(user)
      .values({
        hashedPassword: hashPassword(form.password),
        email: normalizeEmail(email),
        displayEmail: email,
        apiKey: crypto.randomUUID(),
        id: crypto.randomUUID(),
      })
      .returning()
      .get();
  } else {
    await db
      .update(user)
      .set({ hashedPassword: hashPassword(form.password) })
      .where(eq(user.id, dbUser.id))
      .run();
  }

  await setAuthCookie(dbUser.email);
  redirect("/dashboard");
}

export async function login(prevState: unknown, formData: FormData) {
  const result = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
    })
    .safeParse({
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

export async function createWorkout(prevState: unknown, formData: FormData) {
  const { dbUser, db } = await getLoginContext();

  if (!dbUser) {
    redirect("/login");
  }

  const result = z
    .object({
      description: z.string().min(1),
      value: z.string(),
    })
    .safeParse({
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

export async function deleteWorkout(prevState: unknown, formData: FormData) {
  const { dbUser, db } = await getLoginContext();

  if (!dbUser) {
    redirect("/login");
  }

  const result = z
    .object({
      id: z.string().uuid(),
    })
    .safeParse({
      id: formData.get("id"),
    });

  if (!result.success) {
    return "Workout id required";
  }

  const { id } = result.data;

  await db
    .delete(workout)
    .where(and(eq(workout.userId, dbUser.id), eq(workout.id, id)))
    .run();

  revalidatePath("/dashboard");
}

export async function updateWorkout(prevState: unknown, formData: FormData) {
  const { dbUser, db } = await getLoginContext();

  if (!dbUser) {
    redirect("/login");
  }

  const result = z
    .object({
      id: z.string().uuid(),
      date: z.coerce.date(),
    })
    .safeParse({
      date: formData.get("date"),
      id: formData.get("id"),
    });

  if (!result.success) {
    return "Workout id required";
  }

  const { date, id } = result.data;

  await db
    .update(workout)
    .set({ date })
    .where(and(eq(workout.userId, dbUser.id), eq(workout.id, id)))
    .run();

  revalidatePath("/dashboard");
}
