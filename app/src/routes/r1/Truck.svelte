<script lang="ts">
	import type { AbstractDeliveryVehicle } from '$lib/r1/vehicles/AbstractDeliveryVehicle';
	import type { MobilBox } from '$lib/r1/vehicles/MobilBox';
	import { createEventDispatcher } from 'svelte';

	export let idx: number = 0;
	export let vehicle: MobilBox;

	interface $$Events {
		delete: CustomEvent<void>;
		duplicate: CustomEvent<MobilBox>;
	}

	type Dispatcher<TEvents extends Record<keyof TEvents, CustomEvent<any>>> = {
		[Property in keyof TEvents]: TEvents[Property]['detail'];
	};

	const dispatch = createEventDispatcher<Dispatcher<$$Events>>();

	const editableNumbers: [keyof MobilBox, string, string][] = [
		['capacityWidth', 'width', 'width capacity'],
		['capacityHeight', 'height', 'height capacity'],
		['capacityDepth', 'depth', 'depth capacity'],
		['capacityWeight', 'weight', 'weight capacity'],
		['packingFactor', 'pf', 'packing factor'],
		['pricePerKm', 'ppk', 'price per km'],
		['fuelPricePerLiter', 'fp/l', 'fuel price per liter'],
		['fuelConsumptionPerKm', 'fc/km', 'fuel consumption per km']
	];
</script>

<div class="bg-gray-300 min-h-36 py-4 px-4 w-48 flex flex-col">
	<div class="font-bold text-xl mb-4">
		Vehicle #{idx}
	</div>
	{#each editableNumbers as [key, label, title]}
		<label {title} class="flex pb-0.5">
			{label}:
			<input
				type="number"
				bind:value={vehicle[key]}
				class="w-20 ml-auto px-0.5"
				step={0.01}
				min={0}
				max={1000000}
			/>
		</label>
	{/each}

	<div class="mt-4">
		<button class="px-2 bg-red-200" on:click={() => dispatch('delete')}>Delete</button>
		<button class="px-2 bg-blue-200" on:click={() => dispatch('duplicate', vehicle)}
			>Duplicate</button
		>
	</div>
</div>
