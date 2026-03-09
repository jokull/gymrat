import api from "~/lib/api";

async function handler(request: Request) {
  return api.fetch(request);
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
