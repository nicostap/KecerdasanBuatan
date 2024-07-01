<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { loadState, saveState } from '$lib/StateManager';
	import { Random } from '$lib/r1/Random';
	import type { AbstractDeliveryVehicle } from '$lib/r1/vehicles/AbstractDeliveryVehicle';
	import { MobilBox } from '$lib/r1/vehicles/MobilBox';
	import { createEventDispatcher } from 'svelte';

	export let vehicles: MobilBox[];

	const editableNumbers: [string, string, string][] = [
		['capacityWidth', 'width', 'width capacity'],
		['capacityHeight', 'height', 'height capacity'],
		['capacityDepth', 'depth', 'depth capacity'],
		['capacityWeight', 'weight', 'weight capacity'],
		['packingFactor', 'pf', 'packing factor'],
		['pricePerKm', 'ppk', 'price per km'],
		['fuelPricePerLiter', 'fp/l', 'fuel price per liter'],
		['fuelConsumptionPerKm', 'fc/km', 'fuel consumption per km']
	];

	const defaults: Record<
		(typeof editableNumbers)[number][0],
		Record<'min' | 'max' | 'step', number>
	> = {
		// sensible starts
		capacityWidth: { min: 10, max: 100, step: 10 },
		capacityHeight: { min: 10, max: 100, step: 10 },
		capacityDepth: { min: 10, max: 100, step: 10 },
		capacityWeight: { min: 10, max: 500, step: 10 },

		packingFactor: { min: 0.5, max: 0.5, step: 0 },
		pricePerKm: { min: 0.5, max: 2, step: 0.1 },
		fuelPricePerLiter: { min: 0.5, max: 2, step: 0.1 },
		fuelConsumptionPerKm: { min: 0.5, max: 2, step: 0.1 }
	};

	let params = { ...defaults };

	const defaultSeed = '12345678901234567890';
	const defaultAmount = 4;
	let seed = defaultSeed;
	let amount = defaultAmount;

	if (browser) {
		// Load state
		params = loadState('TruckSeed', defaults);
		// vehicles = loadState<MobilBox[]>('TruckSeed.vehicles', []).map(
		// 	({
		// 		capacityWidth,
		// 		capacityHeight,
		// 		capacityDepth,
		// 		capacityWeight,
		// 		packingFactor,
		// 		pricePerKm,
		// 		fuelPricePerLiter,
		// 		fuelConsumptionPerKm
		// 	}) =>
		// 		new MobilBox(
		// 			capacityWidth,
		// 			capacityHeight,
		// 			capacityDepth,
		// 			capacityWeight,
		// 			packingFactor,
		// 			pricePerKm,
		// 			fuelPricePerLiter,
		// 			fuelConsumptionPerKm
		// 		)
		// );
		seed = loadState('TruckSeed.seed', defaultSeed);
		amount = loadState('TruckSeed.amount', defaultAmount);
	}

	$: saveState('TruckSeed', params);
	$: saveState('TruckSeed.vehicles', vehicles);
	$: saveState('TruckSeed.seed', seed);
	$: saveState('TruckSeed.amount', amount);

	function reset() {
		params = { ...defaults };
		seed = defaultSeed;
		amount = defaultAmount;
	}

	function generate() {
		const rand = Random.fromString(seed);

		// Delete all vehicles via API
		fetch(`${base}/r1/api/vehicles`, {
			method: 'DELETE',
			body: JSON.stringify(vehicles.filter((v) => v.id !== undefined).map((v) => v.id)),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		vehicles = Array.from({ length: amount }, (_, i) => {
			return new MobilBox(
				rand.nextStepInclusive(
					params.capacityWidth.min,
					params.capacityWidth.max,
					params.capacityWidth.step
				),
				rand.nextStepInclusive(
					params.capacityHeight.min,
					params.capacityHeight.max,
					params.capacityHeight.step
				),
				rand.nextStepInclusive(
					params.capacityDepth.min,
					params.capacityDepth.max,
					params.capacityDepth.step
				),
				rand.nextStepInclusive(
					params.capacityWeight.min,
					params.capacityWeight.max,
					params.capacityWeight.step
				),
				rand.nextStepInclusive(
					params.packingFactor.min,
					params.packingFactor.max,
					params.packingFactor.step
				),
				rand.nextStepInclusive(
					params.pricePerKm.min,
					params.pricePerKm.max,
					params.pricePerKm.step
				),
				rand.nextStepInclusive(
					params.fuelPricePerLiter.min,
					params.fuelPricePerLiter.max,
					params.fuelPricePerLiter.step
				),
				rand.nextStepInclusive(
					params.fuelConsumptionPerKm.min,
					params.fuelConsumptionPerKm.max,
					params.fuelConsumptionPerKm.step
				)
			);
		});

		// Add new vehicles via API
		vehicles.forEach((vehicle) => {
			fetch(`${base}/r1/api/vehicles`, {
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
					vehicles = vehicles;
				});
		});
	}
</script>

<div class="bg-gray-300 rounded-lg shadow-lg p-6 w-100">
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
