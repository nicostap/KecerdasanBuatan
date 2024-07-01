import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { MobilBox } from '$lib/r1/vehicles/MobilBox';
import type { ClassProperties } from '$lib/TypeUtils';

export const GET: RequestHandler = () => {
	// Get all barang
	return Response.json(prisma.truck.findMany());
};

interface TruckPostData extends ClassProperties<MobilBox> {
	id?: number;
}

export const POST: RequestHandler = async ({ request }) => {
	// Create a new truck
	const truckData: TruckPostData = await request.json();

	// Convert to truck object
	const truck = MobilBox.fromObject(truckData);

	try {
		const newTruck = await prisma.truck.create({
			data: truck.toDatabaseObject()
		});

		return Response.json(newTruck);
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Could not create truck', detail: err });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	// If id exists, update the item, else create a new item
	const truckData: TruckPostData[] = await request.json();

	// Convert to truck objects
	const trucks = truckData.map((truck) => MobilBox.fromObject(truck));

	try {
		await prisma.$transaction(
			trucks.map((truck) =>
				prisma.truck.upsert({
					where: {
						id: truck.id
					},
					update: { ...truck.toDatabaseObject(), id: undefined },
					create: truck.toDatabaseObject()
				})
			)
		);
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Failed to modify truck', detail: err });
	}

	return Response.json(prisma.truck.findMany());
};

export const DELETE: RequestHandler = async ({ request }) => {
	let ids = (await request.json()) as number[] | number;
	if (!Array.isArray(ids)) {
		ids = [ids];
	}

	try {
		const res = await prisma.truck.deleteMany({
			where: {
				id: {
					in: ids
				}
			}
		});

		return Response.json(res);
	} catch (err) {
		console.error(err);
		return error(500, { message: 'Something went wrong when deleting truck(s)', detail: err });
	}
};
