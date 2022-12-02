import type { Database } from "@cloudflare/d1";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "experimental-edge",
};

export interface Env {
  DB: Database;
}

type CfExecutionContext = ExecutionContext & { env: any };

export default async function handler(
  req: NextRequest,
  ctx: CfExecutionContext
) {
  // @ts-ignore
  console.log("jokull", req.jokull);
  console.log("RECEIVED REQ", ctx.env);
  return new Response("asdf", { status: 400 });
  // return new Response(
  //   JSON.stringify({
  //     env: ctx.env,
  //   }),
  //   {
  //     status: 200,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );
}
