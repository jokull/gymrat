import type { Organization, Session, User } from "@clerk/backend-core";
import { ClerkJWTClaims, ServerGetToken } from "@clerk/types";

export type WithEdgeMiddlewareAuthOptions = {
  loadUser?: boolean;
  loadSession?: boolean;
  authorizedParties?: string[];
  jwtKey?: string;
  strict?: boolean;
};

export type WithEdgeMiddlewareAuthCallback<
  Return,
  Options extends WithEdgeMiddlewareAuthOptions
> = (auth: Auth<Options>) => Return;

export type WithEdgeMiddlewareAuthMiddlewareResult<
  CallbackReturn,
  Options extends WithEdgeMiddlewareAuthOptions
> = (auth: Auth<Options>) => Promise<Awaited<CallbackReturn>>;
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type Auth<Options extends WithEdgeMiddlewareAuthOptions = any> =
  Request & {
    auth: EdgeMiddlewareAuth;
  } & (Options extends { loadSession: true }
      ? { session: Session | null }
      : {}) &
    (Options extends { loadUser: true } ? { user: User | null } : {}) &
    (Options extends { loadOrg: true }
      ? { organization: Organization | null }
      : {});

type MiddlewareReturnOptions = Response | null | undefined;
export type MiddlewareResult = MiddlewareReturnOptions;

export type WithAuthMiddlewareHandler<
  Options extends WithEdgeMiddlewareAuthOptions
> = (auth: Auth<Options>) => MiddlewareResult | Promise<MiddlewareResult>;

export type EdgeMiddlewareAuth = {
  sessionId: string | null;
  userId: string | null;
  getToken: ServerGetToken;
  claims: ClerkJWTClaims | null;
};

export type AuthData = {
  sessionId: string | null;
  session: Session | undefined | null;
  userId: string | null;
  user: User | undefined | null;
  getToken: ServerGetToken;
  claims: ClerkJWTClaims | null;
  organization: Organization | undefined | null;
};
