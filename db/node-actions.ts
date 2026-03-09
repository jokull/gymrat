"use server";

import { sealData } from "iron-session";
import { WorkerMailer } from "worker-mailer";
import { z } from "zod";

import { normalizeEmail } from "~/db/passwords";

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
    password: process.env.SECRET_KEY,
    ttl: 60 * 60,
  });

  const contentValue = `https://${process.env.HOST}/verify?token=${token}`;

  const mailer = await WorkerMailer.connect({
    credentials: {
      username: process.env.FASTMAIL_SMTP_USERNAME,
      password: process.env.FASTMAIL_SMTP_PASSWORD,
    },
    authType: "plain",
    host: "smtp.fastmail.com",
    port: 587,
    secure: true,
  });

  await mailer.send({
    from: { name: "Jökull Sólberg", email: "jokull@solberg.is" },
    to: { email },
    subject: "Verify email",
    text: contentValue,
    html: `<a href="${contentValue}">Verify email</a>`,
  });

  return "Signup email was sent just now - follow the link in it to verify and finish signup - don't forget to check spam!";
}
