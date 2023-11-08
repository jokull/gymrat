import * as bcrypt from "bcryptjs";

export function hashPassword(value: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(value, salt);
}

export function verifyPassword(value: string, hash: string) {
  return bcrypt.compareSync(value, hash);
}

export function normalizeEmail(value: string) {
  const email = value.toLowerCase().trim();
  const emailParts = email.split(/@/);

  if (emailParts.length !== 2) {
    return email;
  }

  let username = emailParts[0] as string;
  const domain = emailParts[1] as string;

  if (["gmail.com", "fastmail.com", "googlemail.com"].includes(domain)) {
    username = username.replace(".", "");
  }

  return username + "@" + domain;
}
