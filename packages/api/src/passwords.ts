import * as bcrypt from "bcryptjs";

export function hashPassword(value: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(value, salt);
}

export function verifyPassword(value: string, hash: string) {
  return bcrypt.compareSync(value, hash);
}
