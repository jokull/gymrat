import { type Prisma } from "@prisma/client";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { html } from "hono/html";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { z } from "zod";
import { appRouter, createContextFactory } from "./router";

const formWorkoutSchema = z.object({
  date: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  description: z.string(),
  value: z.string(),
});

export interface Env {
  DB: D1Database;
}

interface Database {
  [Prisma.ModelName.Workout]: Prisma.WorkoutCreateInput;
}

const app = new Hono<{ Bindings: Env }>();

function getDb(binding: D1Database) {
  return new Kysely<Database>({
    dialect: new D1Dialect({ database: binding }),
  });
}

app.post("/", async (c) => {
  const db = getDb(c.env.DB);

  const { searchParams } = new URL(c.req.url);
  const user = searchParams.get("user")?.trim();

  if (!user) {
    return new Response("User is required - add `?user=_`", { status: 400 });
  }

  const form = await c.req.formData();
  const parseResult = formWorkoutSchema.safeParse(
    Object.fromEntries(form.entries())
  );
  if (!parseResult.success) {
    return new Response(JSON.stringify(parseResult.error.errors), {
      status: 400,
    });
  }

  const { date, description, value } = parseResult.data;

  await db
    .insertInto("Workout")
    .values({
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
      value,
      description,
      user,
      date: date.toISOString(),
    })
    .executeTakeFirst();
  return c.json(parseResult.data);
});

app.get("/", async (c) => {
  const today = new Date();
  const user = new URL(c.req.url).searchParams.get("user")?.trim();
  return c.html(
    html`<!DOCTYPE html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css"
          integrity="sha384-X38yfunGUhNzHpBaEBsWLO+A0HDYOQi8ufWDkZ0k9e0eXz/tH3II7uKZ9msv++Ls"
          crossorigin="anonymous"
        />
      </head>
      <body class="container" style="padding: 1rem;">
        <form
          action="/?user=${user}"
          method="post"
          class="pure-form pure-form-stacked"
        >
          <label class="row"
            >Workout <input type="text" name="description" required="required"
          /></label>
          <label class="row"
            >Value <input type="text" name="value" required="required"
          /></label>
          <label class="row"
            >Date
            <input
              name="date"
              type="date"
              value="${today.toISOString().slice(0, 10)}"
              required="required"
          /></label>
          <button class="pure-button pure-button-primary" type="submit">
            Submit
          </button>
        </form>
      </body>`
  );
});

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext | undefined
  ): Promise<Response> {
    if (new URL(request.url).pathname.startsWith("/trpc")) {
      return fetchRequestHandler({
        endpoint: "/trpc",
        req: request,
        router: appRouter,
        createContext: createContextFactory(env.DB),
      });
    } else {
      return app.fetch(request, env, ctx);
    }
  },
};
