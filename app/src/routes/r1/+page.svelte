<script lang="ts" context="module">
	export interface EpochSummaryData {
		epoch: number;
		bestFitness: number;
		bestChromosome: Chromosome;
	}
</script>

<script lang="ts">
	import {
		Chromosome,
		CrossoverType,
		CrossoverTypeLabels,
		MutationType,
		MutationTypeLabels
	} from '$lib/r1/Chromosome';
	import { MobilBox } from '$lib/r1/vehicles/MobilBox';
	import Truck from './Truck.svelte';
	import { generateDijkstra } from '$lib/kb/libs';
	import Barang from './Barang.svelte';
	import { VehicleLoad } from '$lib/r1/VehicleLoad';
	import TruckSeed from './TruckSeed.svelte';
	import BarangSeed from './BarangSeed.svelte';
	import EpochSummary from './EpochSummary.svelte';

	const defaultMobilBoxParams: ConstructorParameters<typeof MobilBox> = [
		100, 100, 100, 100, 0.8, 1000, 10000, 0.1
	];

	let vehicles: MobilBox[] = [];

	let vehicleLoad: VehicleLoad[] = [];

	const cityLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

	const cityWeights = [
		[0, 61, 35, 0, 91, 12],
		[61, 0, 0, 0, 0, 90],
		[35, 0, 0, 100, 41, 0],
		[0, 0, 100, 0, 23, 54],
		[91, 0, 41, 23, 0, 0],
		[12, 90, 0, 54, 0, 0]
	];

	const cityMap = generateDijkstra(cityWeights);

	let gaSeed: string = '1415926535897932384626433832795028841971';
	let targetEpochs: number = 10;
	let targetIndividuals: number = 500;
	let crossoverRate = 0.7;
	let crossoverUniformRate = 0.5;
	let mutationRate = 0.02;
	let crossoverMethod = String(CrossoverType.Uniform);
	let mutationMethod = String(MutationType.AdditionSubtractionInteger);

	let epochSummaries: EpochSummaryData[] = [
		{
			epoch: 0,
			bestFitness: 0,
			bestChromosome: new Chromosome([])
		}
	];

	async function runGa() {}
</script>

<main class="p-4 flex flex-col gap-4">
	<section>
		<h1 class="text-2xl font-bold mb-2">Vehicles</h1>
		<div class="flex gap-4 flex-wrap">
			<TruckSeed bind:vehicles />
			{#each vehicles as vehicle, idx}
				<Truck
					{idx}
					bind:vehicle
					on:delete={() => (vehicles = vehicles.filter((v) => v !== vehicle))}
					on:duplicate={(e) => (vehicles = [...vehicles, e.detail.copy()])}
				/>
			{/each}
			<button
				class="bg-gray-300 min-h-36 py-4 px-4 w-48"
				on:click={() => (vehicles = [...vehicles, new MobilBox(...defaultMobilBoxParams)])}
			>
				+
			</button>
		</div>
	</section>
	<section>
		<h1 class="text-2xl font-bold mb-2">Barang</h1>
		<div class="flex gap-4 flex-wrap">
			<BarangSeed bind:vehicleLoad />
			{#each vehicleLoad as item, idx}
				<Barang
					{idx}
					bind:item
					{cityLabels}
					{cityWeights}
					{cityMap}
					on:delete={() => (vehicleLoad = vehicleLoad.filter((v) => v !== item))}
					on:duplicate={(e) => (vehicleLoad = [...vehicleLoad, e.detail.copy()])}
				/>
			{/each}

			<button
				class="bg-orange-200 min-h-36 py-4 px-4 w-48"
				on:click={() => (vehicleLoad = [...vehicleLoad, new VehicleLoad(5, 5, 5, 2, 0, 0)])}
			>
				+
			</button>
		</div>
	</section>

	<section>
		<h1 class="text-2xl font-bold mb-2">GA Settings</h1>
		<div class="flex flex-col gap-2 bg-gray-200 p-4">
			<div>
				<label>
					GA Seed:
					<input type="text" class="px-2" bind:value={gaSeed} />
				</label>
			</div>

			<label>
				Target Epochs:
				<input type="number" min={1} max={1000} class="px-2" bind:value={targetEpochs} />
			</label>

			<label>
				Target Individuals:
				<input type="number" min={1} max={10000} class="px-2" bind:value={targetIndividuals} />
			</label>

			<label>
				Crossover Rate:
				<input type="number" min={0} max={1} step={0.01} class="px-2" bind:value={crossoverRate} />
			</label>

			<label>
				Uniform Crossover Rate:
				<input
					type="number"
					min={0}
					max={1}
					step={0.01}
					class="px-2"
					bind:value={crossoverUniformRate}
				/>
			</label>

			<label>
				Mutation Rate:
				<input type="number" min={0} max={1} step={0.01} class="px-2" bind:value={mutationRate} />
			</label>

			<label>
				Crossover Type:
				<select class="px-2" bind:value={crossoverMethod}>
					{#each Object.entries(CrossoverTypeLabels) as [type, label]}
						<option value={type}>{label}</option>
					{/each}
				</select>
			</label>

			<label>
				Mutation Type:
				<select class="px-2" bind:value={mutationMethod}>
					{#each Object.entries(MutationTypeLabels) as [type, label]}
						<option value={type}>{label}</option>
					{/each}
				</select>
			</label>

			<div class="flex">
				<button class="bg-blue-200 px-2" on:click={runGa}>Clear & Run</button>
			</div>
		</div>
	</section>

	<section>
		<h1 class="text-2xl font-bold mb-2">Epoch List</h1>
		<div class="flex flex-col gap-2">
			{#each epochSummaries as epochSummary}
				<EpochSummary summary={epochSummary} />
			{/each}
		</div>
	</section>
</main>
