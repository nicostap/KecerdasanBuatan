// See https://kit.svelte.dev/docs/types#app

import type { PrismaClient } from '@prisma/client/extension';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message?: string;
			detail?: unknown;
		}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	const prisma: PrismaClient;
}

export {};
