import { unsealData } from "iron-session";
import { z } from "zod";

export async function unsealVerificationToken(token: string) {
  const unsealed = await unsealData(token, {
    password: process.env.SECRET_KEY ?? "",
    ttl: 60 * 60,
  });
  return z.string().email().parse(unsealed);
}
