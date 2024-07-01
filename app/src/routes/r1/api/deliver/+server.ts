import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { data } = await request.json();

	try {
		// Example: Update delivery_status to true for the related 'barang'
		for (const truckId in data) {
			const hp = await prisma.history_pengiriman.create({
				data: {
					truck_id: Number(truckId)
				}
			});

			const items = data[truckId];
			for (const item in items) {
				await prisma.history_barang.create({
					data: {
						history_pengiriman_id: hp.id,
						barang_id: Number(item),
						truck_id: Number(truckId)
					}
				});
			}
		}

		// Additional updates as needed for history_pengiriman and history_barang

		return new Response(JSON.stringify({ message: 'Result updated successfully.' }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('Error updating result:', e);
		return error(500, { message: 'Failed to update result.' });
	}
};
