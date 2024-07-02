export type ClassProperties<C> = {
	// eslint-disable-next-line @typescript-eslint/ban-types
	[K in keyof C as C[K] extends Function ? never : K]: C[K];
};

import type { Prisma } from '@prisma/client';
export type Locations = Prisma.locationGetPayload<undefined>[];
