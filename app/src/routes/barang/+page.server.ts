export const prerender = false;
export const ssr = false;

import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    return {
        locations: await prisma.location.findMany(),
        items: await prisma.barang.findMany(),
        trucks: await prisma.truck.findMany()
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
    
    updateLocation: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        const { id, name, latitude, longitude } = formData as { [key: string]: string };

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        try {
            await prisma.location.update({
                where:{
                    id: parseFloat(id)
                },
                data: {
                    name,
                    lat,
                    lng
                }
            })
        } catch (err) {
            console.error(err)
            return fail(500, { message: 'Could not update location' })
        }
        return {
            status: 200
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
    },

    createBarang: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        const { Width, Height, Depth, OriginCity, DestCity, MustDeliver } = formData as { [key: string]: string };
    
        const width = parseFloat(Width);
        const height = parseFloat(Height);
        const depth = parseFloat(Depth);
        const origin_city = parseFloat(OriginCity);
        const dest_city = parseFloat(DestCity);
        const must_deliver = MustDeliver == null?false:true;

        try {
            await prisma.barang.create({
                data: {
                    width, 
                    height, 
                    depth, 
                    origin_city, 
                    dest_city, 
                    must_deliver
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

    updateBarang: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        const { id, Width, Height, Depth, OriginCity, DestCity, MustDeliver } = formData as { [key: string]: string };
    
        const width = parseFloat(Width);
        const height = parseFloat(Height);
        const depth = parseFloat(Depth);
        const origin_city = parseFloat(OriginCity);
        const dest_city = parseFloat(DestCity);
        const must_deliver = MustDeliver == null?false:true;

        try {
            await prisma.barang.update({
                where:{
                    id: parseFloat(id)
                },
                data: {
                    width, 
                    height, 
                    depth, 
                    origin_city, 
                    dest_city, 
                    must_deliver
                }
            })
        } catch (err) {
            console.error(err)
            return fail(500, { message: 'Could not update item' })
        }
        return {
            status: 200
        }
    },

    deleteBarang: async ({ url }) => {
        const id = url.searchParams.get("id")
        if (!id) {
            return fail(400, { message: "Invalid request" })
        }
        try {
            await prisma.barang.delete({
                where: {
                    id: Number(id)
                }
            })
        } catch (err) {
            console.error(err)
            return fail(500, { message: 'Something went wrong when deleting item' })
        }

        return {
            status: 200
        }
    },

    createTruck: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        const { Width, Height, Depth, Weight, pf, ppk, cpk, ppl } = formData as { [key: string]: string };
    
        const cap_width = parseFloat(Width);
        const cap_height = parseFloat(Height);
        const cap_depth = parseFloat(Depth);
        const cap_weight = parseFloat(Weight);
        const packing_factor = parseFloat(pf);
        const price_per_km = parseFloat(ppk);
        const fuel_consumpt_per_km = parseFloat(cpk);
        const fuel_price_per_liter = parseFloat(ppl);

        try {
            await prisma.truck.create({
                data: {
                    cap_width,
                    cap_height,
                    cap_depth,
                    cap_weight,
                    packing_factor,
                    price_per_km,
                    fuel_consumpt_per_km,
                    fuel_price_per_liter
                }
            })
        } catch (err) {
            console.error(err)
            return fail(500, { message: 'Could not create truck' })
        }
        return {
            status: 201
        }
    },

    updateTruck: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        const { id, Width, Height, Depth, Weight, pf, ppk, cpk, ppl } = formData as { [key: string]: string };
    
        const cap_width = parseFloat(Width);
        const cap_height = parseFloat(Height);
        const cap_depth = parseFloat(Depth);
        const cap_weight = parseFloat(Weight);
        const packing_factor = parseFloat(pf);
        const price_per_km = parseFloat(ppk);
        const fuel_consumpt_per_km = parseFloat(cpk);
        const fuel_price_per_liter = parseFloat(ppl);

        try {
            await prisma.truck.update({
                where:{
                    id: parseFloat(id)
                },
                data: {
                    cap_width,
                    cap_height,
                    cap_depth,
                    cap_weight,
                    packing_factor,
                    price_per_km,
                    fuel_consumpt_per_km,
                    fuel_price_per_liter
                }
            })
        } catch (err) {
            console.error(err)
            return fail(500, { message: 'Could not update truck' })
        }
        return {
            status: 200
        }
    },

    deleteTruck: async ({ url }) => {
        const id = url.searchParams.get("id")
        if (!id) {
            return fail(400, { message: "Invalid request" })
        }
        try {
            await prisma.barang.delete({
                where: {
                    id: Number(id)
                }
            })
        } catch (err) {
            console.error(err)
            return fail(500, { message: 'Something went wrong when deleting truck' })
        }

        return {
            status: 200
        }
    },
};