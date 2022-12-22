export const config = {
  runtime: "edge",
};

export default async function handler() {
  return new Response("", {
    status: 302,
    headers: {
      "set-cookie":
        "__session=; Max-Age=-1; Path=/; Secure; SameSite=Strict; HttpOnly",
      location: `https://${process.env.HOST ?? "www.gymrat.is"}/`,
    },
  });
}
