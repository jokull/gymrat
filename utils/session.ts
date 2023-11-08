import { eq } from "drizzle-orm";
import { unsealData } from "iron-session/edge";
import { cookies } from "next/headers";
import { z } from "zod";

import { getDrizzle } from "~/db/client";
import { user } from "~/schema";

const sessionSchema = z.object({ email: z.string().email() });

export async function getLoginContext() {
  async function getSession() {
    const cookie = cookies().get("__session")?.value ?? "";
    const data = await unsealData(cookie, {
      password: process.env.SECRET_KEY ?? "",
    });
    return sessionSchema.parse(data);
  }

  const db = getDrizzle();

  const session = await getSession();
  const dbUser = await db.query.user.findFirst({
    where: eq(user.email, session.email),
  });

  return { dbUser, db };
}
