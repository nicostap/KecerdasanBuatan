<script lang="ts">
	import type { AbstractDeliveryVehicle } from '$lib/r1/vehicles/AbstractDeliveryVehicle';
	import type { VehicleLoad } from '$lib/r1/VehicleLoad';
	import { createEventDispatcher } from 'svelte';

	export let idx: number = 0;
	export let item: VehicleLoad;

	export let cityLabels: string[];
	export let cityWeights: number[][];

	// cityMap with dijkstra algorithm
	export let cityMap: number[][];

	interface $$Events {
		delete: CustomEvent<void>;
		duplicate: CustomEvent<VehicleLoad>;
	}

	type Dispatcher<TEvents extends Record<keyof TEvents, CustomEvent<any>>> = {
		[Property in keyof TEvents]: TEvents[Property]['detail'];
	};

	const dispatch = createEventDispatcher<Dispatcher<$$Events>>();

	const editableNumbers: [keyof VehicleLoad, string, string][] = [
		['width', 'width', 'item width'],
		['height', 'height', 'item height'],
		['depth', 'depth', 'item depth'],
		['weight', 'weight', 'item weight']
	];
</script>

<div class="bg-orange-200 min-h-36 py-4 px-4 w-48 flex flex-col">
	<div class="font-bold text-xl mb-4">
		Barang #{idx}
	</div>
	{#each editableNumbers as [key, label, title]}
		<label {title} class="flex pb-0.5">
			{label}:
			<input
				type="number"
				bind:value={item[key]}
				class="w-20 ml-auto px-0.5"
				step={0.01}
				min={0}
				max={1000000}
			/>
		</label>
	{/each}
	<!-- 
	<label title="origin city" class="flex pb-0.5">
		orig:
		<select bind:value={item.originCity} class="w-20 ml-auto px-0.5">
			{#each cityLabels as city, i}
				<option value={i}>{city}</option>
			{/each}
		</select>
	</label> -->

	<label title="destination city" class="flex pb-0.5">
		dest:
		<select bind:value={item.destinationCity} class="w-20 ml-auto px-0.5">
			{#each cityLabels as city, i}
				<option value={i}>{city}</option>
			{/each}
		</select>
	</label>

	<label title="volume" class="flex pb-0.5">
		volume:
		<input type="number" disabled value={item.getVolume()} class="w-20 ml-auto px-0.5" />
	</label>

	<label title="direct destination weight" class="flex pb-0.5">
		direct w:
		<input
			type="number"
			disabled
			value={cityMap[item.destinationCity][item.originCity]}
			class="w-20 ml-auto px-0.5"
		/>
	</label>

	<div class="pt-4 mt-auto">
		<button class="px-2 bg-red-200" on:click={() => dispatch('delete')}>Delete</button>
		<button class="px-2 bg-blue-200" on:click={() => dispatch('duplicate', item)}>Duplicate</button>
	</div>
</div>
