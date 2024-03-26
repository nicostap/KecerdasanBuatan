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
	import { Random } from '$lib/r1/Random';
	import { randomStep } from '$lib/r1/Rand';

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

	// These should be strings for the labels to work
	let crossoverMethod = CrossoverType.Uniform;
	let mutationMethod = MutationType.AdditionSubtractionInteger;

	let epochSummaries: EpochSummaryData[] = [
		{
			epoch: 0,
			bestFitness: 0,
			bestChromosome: new Chromosome([])
		}
	];

	async function runGa() {
		// Seed
		let random = Random.fromString(gaSeed);
		Chromosome.rand = random;

		// Generate initial population
		let chromosomes = [];
		while (chromosomes.length < targetIndividuals) {
			const data = [];
			for (let i = 0; i < vehicleLoad.length; i++) {
				// -1 indicates delayed sending
				data.push(random.nextIntInclusive(-1, vehicles.length - 1));
			}

			const chromosome = new Chromosome(data);

			for (let i = 0; i < vehicles.length; i++) {
				const load = [];
				for (let j = 0; j < vehicleLoad.length; j++) {
					if (data[j] == i) load.push(vehicleLoad[j]);
				}
				chromosome.calculatedFitness += 1000000 * vehicles[i].getFitScore(load);
			}
			if (chromosome.calculatedFitness == 0) {
				chromosomes.push(chromosome);
			}
		}

		// Calculate initial fitness values
		for (let i = 0; i < chromosomes.length; i++) {
			for (let j = 0; j < vehicles.length; j++) {
				const load = [];
				for (let k = 0; k < vehicleLoad.length; k++) {
					if (chromosomes[i].genes[k] == j) load.push(vehicleLoad[k]);
				}
				let calculation = vehicles[j].getProfitScore(load, cityMap);
				chromosomes[i].route.push(calculation[0]);
				chromosomes[i].calculatedFitness += calculation[1];
			}
		}
		chromosomes.sort(Chromosome.compareByFitness);

		// Run the genetic algorithm
		for (let gen = 0; gen < targetEpochs; gen++) {
			const new_chromosomes = [];

			// Elitism
			new_chromosomes.push(chromosomes[chromosomes.length - 1].clone());

			while (new_chromosomes.length < chromosomes.length) {
				// Ranking Selection
				let first_pick, second_pick;
				first_pick = random.nextIntInclusive(
					1,
					(chromosomes.length * (chromosomes.length - 1)) / 2.0
				);
				for (let i = 1; i <= chromosomes.length; i++) {
					if (first_pick <= 0) {
						first_pick = i - 1;
						break;
					}
					first_pick -= i;
				}
				second_pick = random.nextIntInclusive(
					1,
					(chromosomes.length * (chromosomes.length - 1)) / 2.0
				);
				for (let i = 1; i <= chromosomes.length; i++) {
					if (second_pick <= 0) {
						second_pick = i - 1;
						break;
					}
					second_pick -= i;
				}

				let offspring_count = random.nextIntInclusive(1, 2);
				for (let i = 0; i < offspring_count; i++) {
					// Crossover
					let offspring = chromosomes[first_pick].crossover(
						chromosomes[second_pick],
						crossoverMethod,
						crossoverRate
					);

					// Mutation
					offspring = offspring.mutate(mutationMethod, mutationRate, 0, vehicles.length);
					new_chromosomes.push(offspring);
				}
			}
			chromosomes = new_chromosomes;
			chromosomes = chromosomes.slice(chromosomes.length - targetIndividuals, chromosomes.length);

			// Calculate initial fitness values
			for (let i = 0; i < chromosomes.length; i++) {
				for (let j = 0; j < vehicles.length; j++) {
					const load = [];
					for (let k = 0; k < vehicleLoad.length; k++) {
						if (chromosomes[i].genes[k] == j) load.push(vehicleLoad[k]);
					}
					chromosomes[i].calculatedFitness += 1000000 * vehicles[j].getFitScore(load);

					let calculation = vehicles[j].getProfitScore(load, cityMap);
					chromosomes[i].route.push(calculation[0]);
					chromosomes[i].calculatedFitness += calculation[1];
				}
			}
			chromosomes.sort(Chromosome.compareByFitness);
		}
		let result = chromosomes[chromosomes.length - 1];

		console.log(result);
	}
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
				on:click={() => (vehicleLoad = [...vehicleLoad, new VehicleLoad(5, 5, 5, 2, 0)])}
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
				<select
					class="px-2"
					value={String(crossoverMethod)}
					on:change={(e) => {
						// @ts-ignore
						crossoverMethod = Number.parseInt(e.target.value);
					}}
				>
					{#each Object.entries(CrossoverTypeLabels) as [type, label]}
						<option value={type}>{label}</option>
					{/each}
				</select>
			</label>

			<label>
				Mutation Type:
				<select
					class="px-2"
					value={String(mutationMethod)}
					on:change={(e) => {
						// @ts-ignore
						mutationMethod = Number.parseInt(e.target.value);
					}}
				>
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
