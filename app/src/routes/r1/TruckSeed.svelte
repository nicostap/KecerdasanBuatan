<script lang="ts">
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

	const params: Record<
		(typeof editableNumbers)[number][0],
		Record<'min' | 'max' | 'step', number>
	> = {
		// sensible starts
		capacityWidth: { min: 0, max: 100, step: 10 },
		capacityHeight: { min: 0, max: 100, step: 10 },
		capacityDepth: { min: 0, max: 100, step: 10 },
		capacityWeight: { min: 0, max: 500, step: 10 },

		packingFactor: { min: 0.5, max: 0.5, step: 0 },
		pricePerKm: { min: 0.5, max: 2, step: 0.1 },
		fuelPricePerLiter: { min: 0.5, max: 2, step: 0.1 },
		fuelConsumptionPerKm: { min: 0.5, max: 2, step: 0.1 }
	};

	let seed = '12345678901234567890';
	let amount = 4;

	function generateVehicles() {
		const rand = Random.fromString(seed);

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
	}
</script>

<div class="bg-gray-300 min-h-36 py-4 px-4 w-96 flex flex-col">
	<div class="font-bold text-xl mb-4">Seed</div>
	<label class="flex pb-0.5">
		seed:
		<input type="text" class="ml-auto px-2" bind:value={seed} />
	</label>
	<label class="flex pb-0.5">
		amount:
		<input type="number" class="ml-auto px-2" bind:value={amount} />
	</label>
	{#each editableNumbers as [key, label, title]}
		<div class="flex pb-0.5">
			{label}:
			<div class="ml-auto flex">
				<input
					type="number"
					title="{title} min"
					bind:value={params[key].min}
					class="w-20 ml-auto px-0.5"
					step={0.001}
				/>
				<input
					type="number"
					title="{title} max"
					bind:value={params[key].max}
					class="w-20 ml-1 px-0.5"
					step={0.001}
				/>
				<input
					type="number"
					title="{title} step"
					bind:value={params[key].step}
					class="w-20 ml-1 px-0.5"
					step={0.001}
				/>
			</div>
		</div>
	{/each}
	<div class="mt-4">
		<button class="px-2 bg-green-200" on:click={generateVehicles}>Reset & Seed</button>
	</div>
</div>
