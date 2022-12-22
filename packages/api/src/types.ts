export interface Env {
  DB: D1Database;
  SECRET_KEY: string;
  HOST: string;
}

export interface SessionUser {
  id: string;
  email: string;
}
