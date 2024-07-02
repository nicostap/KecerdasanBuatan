<script lang="ts">
	import { base } from '$app/paths';
	import type { AbstractDeliveryVehicle } from '$lib/r1/vehicles/AbstractDeliveryVehicle';
	import type { VehicleLoad } from '$lib/r1/VehicleLoad';
	import { createEventDispatcher, onDestroy } from 'svelte';

	export let idx: number | string = 'new';
	export let item: VehicleLoad;

	export let locations: Object[];
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

	let editing = false;

	let message = '';
	let messageTimeoutId: number | undefined = undefined;
	function timeoutMessage() {
		// if messageTimeoutId is set, clear it
		if (messageTimeoutId) {
			clearTimeout(messageTimeoutId);
			messageTimeoutId = undefined;
		}
		// Set a new timeout message
		messageTimeoutId = setTimeout(() => {
			message = '';
		}, 3000);
	}

	function edit() {
		editing = !editing;

		// If editing, clear the message
		if (editing) {
			clearTimeout(messageTimeoutId);
			message = '';
		}
		// If finished editing, update the item via API
		if (!editing) {
			message = 'Saving...';
			fetch(`${base}/r1/api/vehicleLoad`, {
				method: 'PUT',
				body: JSON.stringify([item.toObject()]),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then((res) => {
				// If 500, then show error message
				if (res.status === 500) {
					message = 'Something went wrong when updating vehicle';
					timeoutMessage();
				} else if (res.status === 200) {
					message = 'Saved';
					timeoutMessage();
				} else {
					message = 'Something went wrong';
					timeoutMessage();
				}
			});
		}
	}

	function save() {
		// Implement save logic here
		editing = false;
	}

	function cancel() {
		// Implement cancel logic here
		editing = false;
	}

	function del() {
		dispatch('delete');
	}

	function duplicate() {
		dispatch('duplicate', item);
	}

	onDestroy(() => {
		clearTimeout(messageTimeoutId);
	});
</script>

<div
	class="bg-gray-100 min-h-36 py-6 px-4 w-80 flex flex-col rounded-lg shadow-lg border border-gray-300"
>
	<div class="bg-gray-200 rounded-t-lg py-2 px-4 mb-4">
		<div class="font-bold text-xl text-gray-700">
			Barang #{idx}
		</div>
		<div class="text-xs text-gray-500">
			ID: {item.id ?? 'new'}
		</div>
	</div>

	<button
		type="button"
		class="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 transition duration-300 rounded-md shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
		on:click={() => dispatch('duplicate', item)}
	>
		Duplicate
	</button>

	{#each editableNumbers as [key, label, title]}
		<label {title} class="flex items-center py-2">
			<span class="text-gray-600 w-28">{label}:</span>
			<input
				type="number"
				bind:value={item[key]}
				class="w-24 ml-auto px-3 py-1 rounded-md bg-white border border-gray-300 focus:outline-none focus:border-blue-400"
				step={0.01}
				min={0}
				max={1000000}
				readonly={!editing}
			/>
		</label>
	{/each}
	<label title="must deliver" class="flex items-center py-2">
		<span class="text-gray-600 w-28">must:</span>
		<input
			type="checkbox"
			bind:checked={item['mustDeliver']}
			class="ml-auto px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:border-blue-400"
			readonly={!editing}
		/>
	</label>
	<label title="origin city" class="flex items-center py-2">
		<span class="text-gray-600 w-28">origin:</span>
		<select
			bind:value={item.originCity}
			class="w-24 ml-auto px-3 py-1 rounded-md bg-white border border-gray-300 focus:outline-none focus:border-blue-400"
			disabled={!editing}
		>
			{#each locations as city}
				city
				<option value={city.id}>{city.name}</option>
			{/each}
		</select>
	</label>
	<label title="destination city" class="flex items-center py-2">
		<span class="text-gray-600 w-28">dest:</span>
		<select
			bind:value={item.destinationCity}
			class="w-24 ml-auto px-3 py-1 rounded-md bg-white border border-gray-300 focus:outline-none focus:border-blue-400"
			disabled={!editing}
		>
			{#each locations as city}
				city
				<option value={city.id}>{city.name}</option>
			{/each}
		</select>
	</label>
	<label title="volume" class="flex items-center py-2">
		<span class="text-gray-600 w-28">volume:</span>
		<input
			type="number"
			disabled
			value={item.getVolume()}
			class="w-24 ml-auto px-3 py-1 rounded-md bg-gray-200 border border-gray-300 focus:outline-none"
		/>
	</label>
	<label title="direct destination weight" class="flex items-center py-2">
		<span class="text-gray-600 w-28">direct w:</span>
		<input
			type="number"
			disabled
			value={cityMap[item.destinationCity - 1][item.originCity - 1]}
			class="w-24 ml-auto px-3 py-1 rounded-md bg-gray-200 border border-gray-300 focus:outline-none"
		/>
	</label>
	<div class="flex justify-end pt-4 mt-auto space-x-4 items-center">
		<div class="px-4 mr-auto text-gray-400">
			{message}
		</div>
		{#if !editing}
			<button
				type="button"
				class="px-4 py-2 bg-blue-400 hover:bg-blue-500 transition duration-300 rounded-md shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
				on:click={edit}
			>
				Edit
			</button>
		{:else}
			<button
				type="button"
				class="px-4 py-2 bg-green-400 hover:bg-green-500 transition duration-300 rounded-md shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
				on:click={edit}
			>
				Save
			</button>
		{/if}
		<button
			type="button"
			class="px-4 py-2 bg-red-400 hover:bg-red-500 transition duration-300 rounded-md shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
			on:click={() => dispatch('delete')}
		>
			Delete
		</button>
	</div>
</div>
