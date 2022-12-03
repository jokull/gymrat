// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

declare namespace App {
	// interface Error {}
	interface Locals {
		api: import('./hooks.server').ApiType;
		clerk: import('clerk-cf-edge/src/cf-edge').ClerkClient;
		auth: import('clerk-cf-edge/src/cf-edge').ClerkUser;
	}
	// interface PageData {}
	// interface Platform {}
}
