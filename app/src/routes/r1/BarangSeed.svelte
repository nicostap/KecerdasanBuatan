<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { loadState, saveState } from '$lib/StateManager';
	import { Random } from '$lib/r1/Random';
	import { VehicleLoad } from '$lib/r1/VehicleLoad';
	import { item } from '@unovis/ts/components/bullet-legend/style';
	import { onDestroy, onMount } from 'svelte';

	export let vehicleLoad: VehicleLoad[];

	const editableNumbers: [string, string, string][] = [
		['width', 'width', 'item width'],
		['height', 'height', 'item height'],
		['depth', 'depth', 'item depth'],
		['weight', 'weight', 'item weight'],
		// ['originCity', 'orig. city', 'origin city'],
		['destinationCity', 'dest. city', 'destination city']
	];

	const defaults: Record<
		(typeof editableNumbers)[number][0],
		Record<'min' | 'max' | 'step', number>
	> = {
		// sensible starts
		width: { min: 5, max: 50, step: 1 },
		height: { min: 5, max: 50, step: 1 },
		depth: { min: 5, max: 50, step: 1 },
		weight: { min: 0, max: 50, step: 1 },
		// originCity: { min: 0, max: 5, step: 1 },
		destinationCity: { min: 1, max: 5, step: 1 }
	};

	let params: Record<
		(typeof editableNumbers)[number][0],
		Record<'min' | 'max' | 'step', number>
	> = { ...defaults };

	const defaultSeed = '12345678901234567890';
	const defaultAmount = 15;

	let seed = defaultSeed;
	let amount = defaultAmount;

	if (browser) {
		// Load state
		params = loadState('BarangSeed', defaults);
		// vehicleLoad = loadState<VehicleLoad[]>('BarangSeed.vehicleLoad', []).map(
		// 	({ width, height, depth, weight, originCity, destinationCity, mustDeliver }) =>
		// 		new VehicleLoad(width, height, depth, weight, originCity, destinationCity, mustDeliver)
		// );
		// seed = loadState('BarangSeed.seed', defaultSeed);
		// amount = loadState('BarangSeed.amount', defaultAmount);
	}

	$: saveState('BarangSeed', params);
	// $: saveState('BarangSeed.vehicleLoad', vehicleLoad);
	// $: saveState('BarangSeed.seed', seed);
	// $: saveState('BarangSeed.amount', amount);

	function reset() {
		params = { ...defaults };
		// vehicleLoad = [];
		seed = defaultSeed;
		amount = defaultAmount;
	}

	function generate() {
		const rand = Random.fromString(seed);

		// Delete all vehicles via API
			fetch(`${base}/r1/api/vehicleLoad`, {
			method: 'DELETE',
			body: JSON.stringify(vehicleLoad.filter((v) => v.id !== undefined).map((v) => v.id)),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		vehicleLoad = Array.from({ length: amount }, (_, i) => {
			return new VehicleLoad(
				rand.nextStepInclusive(params.width.min, params.width.max, params.width.step),
				rand.nextStepInclusive(params.height.min, params.height.max, params.height.step),
				rand.nextStepInclusive(params.depth.min, params.depth.max, params.depth.step),
				rand.nextStepInclusive(params.weight.min, params.weight.max, params.weight.step),
				0,
				rand.nextStepInclusive(
					params.destinationCity.min,
					params.destinationCity.max,
					params.destinationCity.step
				)
			);
		});

			// Add new vehicles via API
			vehicleLoad.forEach((vehicle) => {
			fetch(`${base}/r1/api/vehicleLoad`, {
				method: 'POST',
				body: JSON.stringify(vehicle.toObject()),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then((res) => res.json())
				.then((dbVehicle) => {
					// Need a more proper solution for this, this is just a temporary proof of concept
					vehicle.id = dbVehicle.id;
					vehicleLoad = vehicleLoad;
				});
		});
	}
</script>

<div class="bg-gray-300 rounded-lg shadow-lg p-6 w-96">
	<div class="font-bold text-2xl mb-4 text-gray-800">Generator</div>
	<div class="pb-2">
		<label class="flex items-center pb-1">
			<span class="text-gray-700">Seed:</span>
			<input
				type="text"
				class="ml-auto px-3 py-1 rounded-md border border-gray-400 focus:outline-none focus:border-gray-600"
				bind:value={seed}
			/>
		</label>
		<label class="flex items-center pb-1">
			<span class="text-gray-700">Amount:</span>
			<input
				type="number"
				class="ml-auto px-3 py-1 rounded-md border border-gray-400 focus:outline-none focus:border-gray-600"
				bind:value={amount}
			/>
		</label>
	</div>
	{#each editableNumbers as [key, label, title]}
		<div class="flex items-center pb-2">
			<span class="text-gray-700">{label}:</span>
			<div class="ml-auto flex items-center space-x-2">
				<input
					type="number"
					title="{title} min"
					bind:value={params[key].min}
					class="w-20 px-3 py-1 rounded-md border border-gray-400 focus:outline-none focus:border-gray-600"
					step={0.001}
				/>
				<input
					type="number"
					title="{title} max"
					bind:value={params[key].max}
					class="w-20 px-3 py-1 rounded-md border border-gray-400 focus:outline-none focus:border-gray-600"
					step={0.001}
				/>
				<input
					type="number"
					title="{title} step"
					bind:value={params[key].step}
					class="w-20 px-3 py-1 rounded-md border border-gray-400 focus:outline-none focus:border-gray-600"
					step={0.001}
				/>
			</div>
		</div>
	{/each}
	<div class="mt-4 flex justify-end space-x-4">
		<button
			class="px-4 py-2 bg-green-300 hover:bg-green-400 text-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
			on:click={generate}
		>
			Clean & Generate
		</button>
		<button
			class="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
			on:click={reset}
		>
			Reset Defaults
		</button>
	</div>
</div>
