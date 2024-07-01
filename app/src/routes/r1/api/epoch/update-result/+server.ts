import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { epochId } = await request.json();

	try {
		// Example: Update delivery_status to true for the related 'barang'
		await prisma.barang.update({
			where: { id: epochId },
			data: { delivery_status: true }
		});

		// Additional updates as needed for history_pengiriman and history_barang

		return Response.json({ message: 'Result updated successfully.' });
	} catch (e) {
		console.error('Error updating result:', e);
		return error(500, { message: 'Failed to update result.' });
	}
};
