export const prerender = false;
export const ssr = false;

import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    return {
        locations: await prisma.location.findMany(),
    }
};

export const actions: Actions = {
    createLocation: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        const { name, latitude, longitude } = formData as { [key: string]: string };

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        try {
            await prisma.location.create({
                data: {
                    name,
                    lat,
                    lng
                }
            })
        } catch (err) {
            console.error(err)
            return fail(500, { message: 'Could not create location' })
        }
        return {
            status: 201
        }
    },

    deleteLocation: async ({ url }) => {
        const id = url.searchParams.get("id")
        if (!id) {
            return fail(400, { message: "Invalid request" })
        }
        try {
            await prisma.location.delete({
                where: {
                    id: Number(id)
                }
            })
        } catch (err) {
            console.error(err)
            return fail(500, { message: 'Something went wrong when deleting location' })
        }

        return {
            status: 200
        }
    }
};