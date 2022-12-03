import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'api/src/router';
import { createClerkClient, getClerkAuth } from 'clerk-cf-edge/src';
import superjson from 'superjson';
import type { RequestEvent } from './routes/$types';

// async function getClerkSession(cookies: Cookies) {
// 	const splitPem = env.CLERK_JWT_VERIFICATION_KEY.match(/.{1,64}/g);
// 	const publicKey =
// 		'-----BEGIN PUBLIC KEY-----\n' + splitPem?.join('\n') + '\n-----END PUBLIC KEY-----';

// 	const sessToken = cookies.get('__session');
// 	if (!sessToken) {
// 		return { state: 'unauthorized' };
// 	}

// 	let verified;

// 	try {
// 		verified = await jwt.verify(sessToken, publicKey);
// 	} catch (error) {
// 		return { state: 'invalid' };
// 	}

// 	return verified
// 		? { state: 'authorized', user: jwt.decode(sessToken).payload }
// 		: { status: 'unauthorized' };
// }

function getApiClient(fetch: RequestEvent['fetch']) {
	return createTRPCProxyClient<AppRouter>({
		transformer: superjson,
		links: [
			httpBatchLink({
				url: env.API_ENDPOINT,
				headers: { Authorization: 'jokull' },
				fetch: fetch
			})
		]
	});
}

export type ApiType = ReturnType<typeof getApiClient>;

export const handle: Handle = async ({ event, resolve }) => {
	// const auth = await getClerkSession(event.cookies);
	event.locals.api = getApiClient(event.fetch);
	event.locals.auth = await getClerkAuth(event.request, event.cookies, {});
	event.locals.clerk = createClerkClient({ apiKey: env.CLERK_API_KEY });
	const response = await resolve(event);
	return response;
};
