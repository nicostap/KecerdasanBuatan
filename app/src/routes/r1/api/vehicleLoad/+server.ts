import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { VehicleLoad } from '$lib/r1/VehicleLoad';
import type { ClassProperties } from '$lib/TypeUtils';

export const GET: RequestHandler = () => {
	// Get all barang
	return Response.json(prisma.barang.findMany());
};

interface ItemPostData extends ClassProperties<VehicleLoad> {
	id?: number;
}

export const POST: RequestHandler = async ({ request }) => {
	// Create a new truck
	const itemData: ItemPostData = await request.json();

	// Convert to truck object
	const item = VehicleLoad.fromObject(itemData);

	try {
		const newBarang = await prisma.barang.create({
			data: item.toDatabaseObject()
		});

		return Response.json(newBarang);
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Could not create item', detail: err });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	// If id exists, update the item, else create a new item
	const itemData: ItemPostData[] = await request.json();

	// Convert to item objects
	const items = itemData.map((item) => VehicleLoad.fromObject(item));

	try {
		await prisma.$transaction(
			items.map((item) =>
				prisma.barang.upsert({
					where: {
						id: item.id
					},
					update: { ...item.toDatabaseObject(), id: undefined },
					create: item.toDatabaseObject()
				})
			)
		);
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Failed to modify item', detail: err });
	}

	return Response.json(prisma.barang.findMany());
};

export const DELETE: RequestHandler = async ({ request }) => {
	let ids = (await request.json()) as number[] | number;
	if (!Array.isArray(ids)) {
		ids = [ids];
	}

	try {
		const res = await prisma.barang.deleteMany({
			where: {
				id: {
					in: ids
				}
			}
		});

		return Response.json(res);
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Something went wrong when deleting items(s)', detail: err });
	}
};
