import {
  AuthStatus,
  Base,
  ClerkClient,
  createGetToken,
  createSignedOutState,
} from "@clerk/backend-core";

export type { ClerkClient } from "@clerk/backend-core";
// Export sub-api objects
export {
  allowlistIdentifiers,
  clients,
  emails,
  invitations,
  organizations,
  sessions,
  smsMessages,
  users,
  clerkApi,
};
export { createClerkClient };

import { ClerkAPI, createClerkClient } from "./ClerkAPI";

/**
 *
 * Required implementations for the runtime:
 * 1. Import Key
 * 2. Verify Signature
 * 3. Decode Base64
 * 4. ClerkAPI export with fetcher implementation
 * 5. Fetch Interstitial
 *
 */

const importKey = async (jwk: JsonWebKey, algorithm: Algorithm) => {
  return await crypto.subtle.importKey("jwk", jwk, algorithm, true, ["verify"]);
};

const verifySignature = async (
  algorithm: Algorithm,
  key: CryptoKey,
  signature: Uint8Array,
  data: Uint8Array
) => {
  return await crypto.subtle.verify(algorithm, key, signature, data);
};

const decodeBase64 = (base64: string) => atob(base64);

/** Base initialization */
export const cfEdgeBase = new Base(importKey, verifySignature, decodeBase64);

/** Export standalone verifySessionToken */
export const verifySessionToken = cfEdgeBase.verifySessionToken;

/** Export ClerkBackendAPI API client */
const allowlistIdentifiers = ClerkAPI.allowlistIdentifiers;
const clients = ClerkAPI.clients;
const emails = ClerkAPI.emails;
const invitations = ClerkAPI.invitations;
const organizations = ClerkAPI.organizations;
const sessions = ClerkAPI.sessions;
const smsMessages = ClerkAPI.smsMessages;
const users = ClerkAPI.users;
const clerkApi = ClerkAPI;

export function fetchInterstitial() {
  return ClerkAPI.fetchInterstitial();
}

export type ClerkUser = Awaited<ReturnType<typeof getClerkAuth>>;

export async function getClerkAuth(
  req: Request,
  cookies: { get: (key: string) => string | undefined },
  options: {
    authorizedParties?: string[];
    jwtKey?: string;
  }
) {
  const { jwtKey, authorizedParties } = options;

  const cookieToken = cookies.get("__session");
  const clientUat = cookies.get("__client_uat");

  const headerToken = req.headers.get("authorization");
  const { status, interstitial, sessionClaims, errorReason } =
    await cfEdgeBase.getAuthState({
      cookieToken,
      headerToken,
      clientUat,
      origin: req.headers.get("origin"),
      host: req.headers.get("host") as string,
      userAgent: req.headers.get("user-agent"),
      forwardedPort: req.headers.get("x-forwarded-port"),
      forwardedHost: req.headers.get("x-forwarded-host"),
      referrer: req.headers.get("referrer"),
      authorizedParties,
      jwtKey,
      fetchInterstitial,
    });

  if (status === AuthStatus.Interstitial) {
    console.error(errorReason);
    throw new Error(interstitial as string);
    // return interstitialResponse(interstitial as string, errorReason);
  }

  if (status === AuthStatus.SignedOut) {
    return createSignedOutState();
  }

  if (!sessionClaims) {
    throw new Error("An unexpected error occurred");
  }

  const sessionId = sessionClaims.sid;
  const userId = sessionClaims.sub;

  const [user, session] = await Promise.all([
    ClerkAPI.users.getUser(userId),
    ClerkAPI.sessions.getSession(sessionId),
  ]);

  const getToken = createGetToken({
    sessionId,
    cookieToken,
    headerToken: headerToken || "",
    fetcher: (...args) => ClerkAPI.sessions.getToken(...args),
  });

  return {
    user,
    session,
    sessionId,
    userId,
    getToken,
    claims: sessionClaims,
    orgId: null,
    organizations: null,
  };
}

export function setClerkApiKey(value: string) {
  ClerkAPI.apiKey = value;
}

export const clerkClient: ClerkClient = createClerkClient();
