"use server";

import { sealData } from "iron-session/edge";
import nodemailer from "nodemailer";
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
    password: process.env.SECRET_KEY ?? "",
    ttl: 60 * 60,
  });

  const contentValue = `https://${process.env.HOST}/verify?token=${token}`;

  // Nodemailer transport configuration
  const transporter = nodemailer.createTransport({
    host: "smtp.fastmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.FASTMAIL_SMTP_USERNAME,
      pass: process.env.FASTMAIL_SMTP_PASSWORD,
    },
  });

  // Send email
  await transporter.sendMail({
    from: '"Jökull Sólberg" <jokull@solberg.is>', // sender address
    to: email, // list of receivers
    subject: "Verify email", // Subject line
    text: contentValue, // plain text body
    html: `<a href="${contentValue}">Verify email</a>`,
  });
}
