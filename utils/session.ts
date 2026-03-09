import { unsealData } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDrizzle } from "~/db/client";

const sessionSchema = z.object({ email: z.string().email() });

export async function getLoginContext() {
  async function getSession() {
    const cookie = (await cookies()).get("__session")?.value ?? "";
    const data = await unsealData(cookie, {
      password: process.env.SECRET_KEY,
    });
    const result = sessionSchema.safeParse(data);
    if (result.success) {
      return result.data;
    }
    redirect("/login");
  }

  const db = getDrizzle();

  const session = await getSession();
  const dbUser = await db.query.user.findFirst({
    where: { email: session.email },
  });

  return { dbUser, db };
}
