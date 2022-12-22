export function normalizeEmail(value: string) {
  const email = value.toLowerCase().trim();
  const emailParts = email.split(/@/);

  if (emailParts.length !== 2) {
    return email;
  }

  let username = emailParts[0];
  const domain = emailParts[1];

  if (["gmail.com", "fastmail.com", "googlemail.com"].includes(domain)) {
    username = username.replace(".", "");
  }

  return username + "@" + domain;
}
