<script lang="ts">
	import { browser } from '$app/environment';
	import { loadState, saveState } from '$lib/StateManager';
	import { Random } from '$lib/r1/Random';
	import { VehicleLoad } from '$lib/r1/VehicleLoad';
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
		destinationCity: { min: 0, max: 5, step: 1 }
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
		vehicleLoad = loadState('BarangSeed.vehicleLoad', []);
		seed = loadState('BarangSeed.seed', defaultSeed);
		amount = loadState('BarangSeed.amount', defaultAmount);
	}

	$: saveState('BarangSeed', params);
	$: saveState('BarangSeed.vehicleLoad', vehicleLoad);
	$: saveState('BarangSeed.seed', seed);
	$: saveState('BarangSeed.amount', amount);

	function reset() {
		params = { ...defaults };
		vehicleLoad = [];
		seed = defaultSeed;
		amount = defaultAmount;
	}

	function generate() {
		const rand = Random.fromString(seed);

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
	}
</script>

<div class="bg-orange-200 min-h-36 py-4 px-4 w-96 flex flex-col">
	<div class="font-bold text-xl mb-4">Generator</div>
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
		<button class="px-2 bg-green-200" on:click={generate}>Clean & Generate</button>
		<button class="px-2 bg-yellow-200" on:click={reset}>Reset Defaults</button>
	</div>
</div>
