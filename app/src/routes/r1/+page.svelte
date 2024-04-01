<script lang="ts" context="module">
	export interface EpochSummaryData {
		epoch: number;
		bestFitness: number;
		topIndividuals: Chromosome[];
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
	import { generateDijkstra, wait } from '$lib/kb/libs';
	import Barang from './Barang.svelte';
	import { VehicleLoad } from '$lib/r1/VehicleLoad';
	import TruckSeed from './TruckSeed.svelte';
	import BarangSeed from './BarangSeed.svelte';
	import EpochSummary from './EpochSummary.svelte';
	import { Random } from '$lib/r1/Random';
	import GaSettings, { GAMode } from './GASettings.svelte';
	import { cityLabels } from '$lib/r1/Data';

	const defaultMobilBoxParams: ConstructorParameters<typeof MobilBox> = [
		100, 100, 100, 100, 0.8, 1000, 10000, 0.1
	];

	let vehicles: MobilBox[] = [];

	let vehicleLoad: VehicleLoad[] = [];

	const cityWeights = [
		[0, 61, 35, 0, 91, 12],
		[61, 0, 0, 0, 0, 90],
		[35, 0, 0, 100, 41, 0],
		[0, 0, 100, 0, 23, 54],
		[91, 0, 41, 23, 0, 0],
		[12, 90, 0, 54, 0, 0]
	];

	const cityMap = generateDijkstra(cityWeights);

	let selectedEpoch = -1;
	let gaSettings = {
		mode: GAMode.Once,
		gaSeed: '1415926535897932384626433832795028841971',
		once: {
			targetEpochs: 10,
			targetIndividuals: 500,
			crossoverRate: 0.7,
			crossoverUniformRate: 0.5,
			mutationRate: 0.02,
			crossoverMethod: CrossoverType.Uniform,
			mutationMethod: MutationType.AdditionSubtractionInteger
		},
		tryAll: {
			targetEpochs: { min: 10, max: 100, step: 10 },
			targetIndividuals: { min: 100, max: 1000, step: 100 },
			crossoverRate: { min: 0.5, max: 0.9, step: 0.1 },
			crossoverUniformRate: { min: 0.1, max: 0.9, step: 0.1 },
			mutationRate: { min: 0.01, max: 0.1, step: 0.01 },
			crossoverMethod: [CrossoverType.Uniform],
			mutationMethod: [MutationType.AdditionSubtractionInteger, MutationType.RandomInteger]
		}
	};

	// let gaSeed: string = '1415926535897932384626433832795028841971';
	// let targetEpochs: number = 10;
	// let targetIndividuals: number = 500;
	// let crossoverRate = 0.7;
	// let mutationRate = 0.02;
	$: gaSeed = gaSettings.gaSeed;
	$: targetEpochs = gaSettings.mode === GAMode.Once ? gaSettings.once.targetEpochs : 0;
	$: targetIndividuals = gaSettings.mode === GAMode.Once ? gaSettings.once.targetIndividuals : 0;
	$: crossoverRate = gaSettings.mode === GAMode.Once ? gaSettings.once.crossoverRate : 0;
	$: mutationRate = gaSettings.mode === GAMode.Once ? gaSettings.once.mutationRate : 0;

	// These should be strings for the labels to work
	// let crossoverMethod = CrossoverType.Uniform;
	// let mutationMethod = MutationType.AdditionSubtractionInteger;
	$: crossoverMethod =
		gaSettings.mode === GAMode.Once ? gaSettings.once.crossoverMethod : CrossoverType.Uniform;
	$: mutationMethod =
		gaSettings.mode === GAMode.Once
			? gaSettings.once.mutationMethod
			: MutationType.AdditionSubtractionInteger;

	let epochSummaries: EpochSummaryData[] = [];
	let chromosomeProgress = 0;

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

			// await wait(1);
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
		chromosomeProgress = 0;

		// Add to epoch summaries
		epochSummaries = [
			{
				epoch: 0,
				bestFitness: chromosomes[chromosomes.length - 1].calculatedFitness,
				topIndividuals: chromosomes.slice(chromosomes.length - 5, chromosomes.length).reverse()
			}
		];

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
					offspring = offspring.mutate(mutationMethod, mutationRate, -1, vehicles.length);
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

			// Add to epoch summaries
			epochSummaries = [
				...epochSummaries,
				{
					epoch: gen + 1,
					bestFitness: chromosomes[chromosomes.length - 1].calculatedFitness,
					topIndividuals: chromosomes.slice(chromosomes.length - 5, chromosomes.length).reverse()
				}
			];

			chromosomeProgress = gen + 1;
			await wait(0);
		}
		let result = chromosomes[chromosomes.length - 1];

		console.log(result);

		let sortedItems: number[][][] = [];
		for (let t = 0; t < vehicles.length; t++) {
			sortedItems[t] = [];
		}
		for (let i = 0; i < result.genes.length; i++) {
			if (result.genes[i] == -1) continue;
			sortedItems[result.genes[i]].push([
				i,
				vehicleLoad[i].getVolume(),
				vehicleLoad[i].destinationCity
			]);
		}

		for (let t = 0; t < vehicles.length; t++) {
			console.log('Truck ' + t + ': ');
			for (let i = 0; i < sortedItems[t].length; i++)
				console.log(
					'id : ' +
						sortedItems[t][i][0] +
						', volume : ' +
						sortedItems[t][i][1] +
						', destination : ' +
						sortedItems[t][i][2] +
						'\n'
				);
			console.log('Route for truck ' + t + ' : ' + result.route[t]);
		}
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
				on:click={() => (vehicleLoad = [...vehicleLoad, new VehicleLoad(5, 5, 5, 2, 0, 0)])}
			>
				+
			</button>
		</div>
	</section>

	<GaSettings
		run={runGa}
		bind:settings={gaSettings}
		progressMax={gaSettings.once.targetEpochs}
		progress={chromosomeProgress}
	/>

	<section>
		<h1 class="text-2xl font-bold mb-2">Epoch List</h1>
		<div class="flex flex-col gap-2">
			{#each epochSummaries as epochSummary}
				<EpochSummary
					summary={epochSummary}
					selected={epochSummary.epoch === selectedEpoch}
					on:click={() => {
						if (selectedEpoch === epochSummary.epoch) {
							selectedEpoch = -1;
						} else {
							selectedEpoch = epochSummary.epoch;
						}
					}}
				/>
			{/each}
		</div>
	</section>
</main>
