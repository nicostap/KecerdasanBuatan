<script lang="ts" context="module">
	export interface EpochSummaryData {
		epoch: number;
		description?: string;
		bestFitness: number;
		topIndividuals: Chromosome[];
		defectiveRate: number;
		truckInfo: [number, VehicleLoad][][][];
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
	import GaSettings, { GAMode, type GASettings } from './GASettings.svelte';
	import { cityLabels } from '$lib/r1/Data';
	import SummaryCharts from './SummaryCharts.svelte';
	import CityMap from './CityMap.svelte';
	import { createAdjacencyMatrix } from '$lib/map/AdjacencyMatrix'
	import type { PageData } from '../$types';

	export let data: PageData;

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

	// const cityWeights = createAdjacencyMatrix(data.locations);

	const cityMap = generateDijkstra(cityWeights);

	let selectedEpoch = -1;
	let gaSettings: GASettings = {
		mode: GAMode.Once,
		gaSeed: '1415926535897932384626433832795028841971',
		fitScoreMultiplier: 10000000,
		delayedPenalty: -1000,
		mustDeliverPenalty: -10000000,
		once: {
			targetEpochs: 30,
			targetIndividuals: 500,
			crossoverRate: 0.7,
			crossoverUniformRate: 0.5,
			mutationRate: 0.02,
			crossoverMethod: CrossoverType.OnePoint,
			mutationMethod: MutationType.AdditionSubtractionInteger
		},
		tryAll: {
			targetEpochs: 30,
			targetIndividuals: { min: 500, max: 500, step: 100 },
			crossoverRate: { min: 0.4, max: 0.6, step: 0.1 },
			crossoverUniformRate: { min: 0.5, max: 0.5, step: 0.1 },
			mutationRate: { min: 0.01, max: 0.1, step: 0.02 },
			crossoverMethod: [CrossoverType.Uniform],
			mutationMethod: [MutationType.AdditionSubtractionInteger, MutationType.RandomInteger]
		}
	};

	$: tryAllTargetEpochsTotal =
		Math.max(
			Math.ceil(
				(gaSettings.tryAll.targetIndividuals.max - gaSettings.tryAll.targetIndividuals.min) /
					gaSettings.tryAll.targetIndividuals.step
			) + 1,
			1
		) *
		Math.max(
			Math.ceil(
				(gaSettings.tryAll.crossoverRate.max - gaSettings.tryAll.crossoverRate.min) /
					gaSettings.tryAll.crossoverRate.step
			) + 1,
			1
		) *
		Math.max(
			Math.ceil(
				(gaSettings.tryAll.mutationRate.max - gaSettings.tryAll.mutationRate.min) /
					gaSettings.tryAll.mutationRate.step
			) + 1,
			1
		) *
		gaSettings.tryAll.crossoverMethod.length *
		gaSettings.tryAll.mutationMethod.length *
		gaSettings.tryAll.targetEpochs;

	// let gaSeed: string = '1415926535897932384626433832795028841971';
	// let targetEpochs: number = 10;
	// let targetIndividuals: number = 500;
	// let crossoverRate = 0.7;
	// let mutationRate = 0.02;
	// $: gaSeed = gaSettings.gaSeed;
	// $: targetEpochs = gaSettings.mode === GAMode.Once ? gaSettings.once.targetEpochs : 0;
	// $: targetIndividuals = gaSettings.mode === GAMode.Once ? gaSettings.once.targetIndividuals : 0;
	// $: crossoverRate = gaSettings.mode === GAMode.Once ? gaSettings.once.crossoverRate : 0;
	// $: mutationRate = gaSettings.mode === GAMode.Once ? gaSettings.once.mutationRate : 0;

	// // These should be strings for the labels to work
	// // let crossoverMethod = CrossoverType.Uniform;
	// // let mutationMethod = MutationType.AdditionSubtractionInteger;
	// $: crossoverMethod =
	// 	gaSettings.mode === GAMode.Once ? gaSettings.once.crossoverMethod : CrossoverType.Uniform;
	// $: mutationMethod =
	// 	gaSettings.mode === GAMode.Once
	// 		? gaSettings.once.mutationMethod
	// 		: MutationType.AdditionSubtractionInteger;

	let epochSummaries: EpochSummaryData[] = [];
	let chromosomeProgress = 0;

	function addSummary(chromosomes: Chromosome[], epoch: number) {
		const defectiveRate =
			chromosomes.filter((c) => c.calculatedDefective).length / chromosomes.length;
		const bestFitness = chromosomes[chromosomes.length - 1].calculatedFitness;
		const topIndividuals = chromosomes.slice(chromosomes.length - 5, chromosomes.length).reverse();
		const truckInfo = topIndividuals.map((c) => {
			const truck: [number, VehicleLoad][][] = Array.from({ length: vehicles.length }, () => []);
			for (let i = 0; i < c.genes.length; i++) {
				if (c.genes[i] == -1) continue;
				truck[c.genes[i]].push([i, vehicleLoad[i]]);
			}
			return truck;
		});
		epochSummaries = [
			{ epoch, bestFitness, topIndividuals, defectiveRate, truckInfo },
			...epochSummaries
		];
	}

	async function runGaTryAll() {
		const results: EpochSummaryData[] = [];
		chromosomeProgress = 0;

		const workers: Promise<unknown>[] = [];

		for (let crossoverMethod of gaSettings.tryAll.crossoverMethod) {
			for (let mutationMethod of gaSettings.tryAll.mutationMethod) {
				for (
					let targetIndividuals = gaSettings.tryAll.targetIndividuals.min;
					targetIndividuals <= gaSettings.tryAll.targetIndividuals.max;
					targetIndividuals += gaSettings.tryAll.targetIndividuals.step
				) {
					for (
						let crossoverRate = gaSettings.tryAll.crossoverRate.min;
						crossoverRate <= gaSettings.tryAll.crossoverRate.max;
						crossoverRate += gaSettings.tryAll.crossoverRate.step
					) {
						for (
							let mutationRate = gaSettings.tryAll.mutationRate.min;
							mutationRate <= gaSettings.tryAll.mutationRate.max;
							mutationRate += gaSettings.tryAll.mutationRate.step
						) {
							const pn = new Promise<void>((resolve) => {
								const worker = new Worker(new URL('./GARunner.ts', import.meta.url), {
									type: 'module'
								});

								worker.onmessage = (e) => {
									const data = e.data;
									if ('chromosomeProgress' in e.data) {
										chromosomeProgress += data.chromosomeProgress;
									} else if ('epochSummaries' in e.data) {
										const lastSummary: EpochSummaryData = data.epochSummaries[0];
										lastSummary.description = `c: ${CrossoverTypeLabels[crossoverMethod]}, m: ${MutationTypeLabels[mutationMethod]}, ti: ${targetIndividuals}, c%: ${crossoverRate}, m%: ${mutationRate}`;

										// make sure to also recast the chromosome and vehicleload objects
										lastSummary.topIndividuals = lastSummary.topIndividuals.map((c) => {
											const newC = new Chromosome(c.genes);
											newC.calculatedFitness = c.calculatedFitness;
											newC.calculatedDefective = c.calculatedDefective;
											newC.route = c.route;
											return newC;
										});

										lastSummary.truckInfo = lastSummary.truckInfo.map((truck) =>
											truck.map((route) =>
												route.map(([i, v]) => [
													i,
													new VehicleLoad(
														v.width,
														v.height,
														v.depth,
														v.weight,
														v.originCity,
														v.destinationCity,
														v.mustDeliver
													)
												])
											)
										);
										results.push(lastSummary);
										worker.terminate();
										resolve();
									}
								};

								worker.postMessage({
									vehicles: vehicles,
									vehicleLoad: vehicleLoad,
									runGaParams: {
										gaSeed: gaSettings.gaSeed,
										targetEpochs: gaSettings.tryAll.targetEpochs,
										targetIndividuals: targetIndividuals,
										crossoverRate: crossoverRate,
										mutationRate: mutationRate,
										crossoverMethod: crossoverMethod,
										mutationMethod: mutationMethod,
										fitScoreMultiplier: gaSettings.fitScoreMultiplier,
										gaSettings: gaSettings
									}
								});
							});

							workers.push(pn);

							// await runGa(
							// 	gaSettings.gaSeed,
							// 	gaSettings.tryAll.targetEpochs,
							// 	targetIndividuals,
							// 	crossoverRate,
							// 	mutationRate,
							// 	crossoverMethod,
							// 	mutationMethod,
							// 	true
							// );
						}
					}
				}
			}
		}

		// wait for all workers to finish
		await Promise.all(workers);
		await wait(0);

		epochSummaries = results;
		console.log(results);
		console.log('Done!');
	}

	async function runGa(
		gaSeed: string,
		targetEpochs: number,
		targetIndividuals: number,
		crossoverRate: number,
		mutationRate: number,
		crossoverMethod: CrossoverType,
		mutationMethod: MutationType,
		bulk = false
	) {
		// Set for fixed epoch mode or non-fixed epoch mode
		let isEpochFixed = false;
		let maxConvergeCounter = 20;

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

			let isDefective = false;
			for (let i = 0; i < vehicles.length; i++) {
				const load = [];
				for (let j = 0; j < vehicleLoad.length; j++) {
					if (data[j] == i) load.push(vehicleLoad[j]);
				}
				const fitScore = vehicles[i].getFitScore(load);
				chromosome.calculatedFitness += gaSettings.fitScoreMultiplier * fitScore;
				isDefective ||= fitScore !== 0;

				let calculation = vehicles[i].getProfitScore(load, cityMap);
				chromosome.calculatedFitness += calculation[1];
				chromosome.route.push(calculation[0]);
			}
			chromosome.calculatedDefective = isDefective;

			// Penalty if item that must be delivered is delayed
			for (let i = 0; i < vehicleLoad.length; i++) {
				if (data[i] == -1) {
					chromosome.calculatedFitness += gaSettings.delayedPenalty;
				}

				if (vehicleLoad[i].mustDeliver && data[i] == -1) {
					chromosome.calculatedFitness += gaSettings.mustDeliverPenalty;
				}
			}

			chromosomes.push(chromosome);
			if (chromosomes.length % 10 == 0) await wait(0);
		}

		chromosomes.sort(Chromosome.compareByFitness);
		if (!bulk) chromosomeProgress = 0;
		await wait(0);

		// Add to epoch summaries
		epochSummaries = [];
		addSummary(chromosomes, 0);

		// Run the genetic algorithm
		let convergeCounter = maxConvergeCounter;
		for (let gen = 0; gen < targetEpochs; gen++) {
			// For checking convergence
			let old_fitness = chromosomes[chromosomes.length - 1].calculatedFitness;
			if (convergeCounter == 0 && !isEpochFixed) {
				console.log('Stop!');
				chromosomeProgress = targetEpochs;
				break;
			}

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
					offspring = offspring.mutate(mutationMethod, mutationRate, -1, vehicles.length - 1);
					new_chromosomes.push(offspring);
				}
			}
			chromosomes = new_chromosomes;

			// Calculate initial fitness values
			for (let i = 0; i < chromosomes.length; i++) {
				let isDefective = false;
				for (let j = 0; j < vehicles.length; j++) {
					const load = [];
					for (let k = 0; k < vehicleLoad.length; k++) {
						if (chromosomes[i].genes[k] == j) load.push(vehicleLoad[k]);
					}
					const fitScore = vehicles[j].getFitScore(load);
					chromosomes[i].calculatedFitness +=
						gaSettings.fitScoreMultiplier * vehicles[j].getFitScore(load);
					isDefective ||= fitScore !== 0;

					let calculation = vehicles[j].getProfitScore(load, cityMap);
					chromosomes[i].route.push(calculation[0]);
					chromosomes[i].calculatedFitness += calculation[1];
				}
				chromosomes[i].calculatedDefective = isDefective;

				// Penalty if item that must be delivered is delayed
				for (let j = 0; j < vehicleLoad.length; j++) {
					if (chromosomes[i].genes[j] == -1) {
						chromosomes[i].calculatedFitness += gaSettings.delayedPenalty;
					}

					if (vehicleLoad[j].mustDeliver && chromosomes[i].genes[j] == -1) {
						chromosomes[i].calculatedFitness += gaSettings.mustDeliverPenalty;
					}
				}
			}
			chromosomes.sort(Chromosome.compareByFitness);

			chromosomes = chromosomes.slice(chromosomes.length - targetIndividuals, chromosomes.length);

			// Converge counter
			let new_fitness = chromosomes[chromosomes.length - 1].calculatedFitness;
			if (old_fitness == new_fitness) {
				convergeCounter--;
			} else {
				convergeCounter = maxConvergeCounter;
			}

			// Add to epoch summaries
			addSummary(chromosomes, gen + 1);

			chromosomeProgress++;
			await wait(0);
		}
	}
	let filterKeyword = "";
	let sortCriteria = "epoch";

	// Computed property for filtered and sorted epoch summaries
	$: filteredAndSortedEpochSummaries = epochSummaries
		.filter((summary) => {
			const regex = new RegExp(filterKeyword, "i");
			return (
				regex.test(summary.epoch.toString()) ||
				(summary.description && regex.test(summary.description)) ||
				regex.test(summary.bestFitness.toString()) ||
				summary.topIndividuals.some((ind) =>
					regex.test(ind.calculatedFitness.toString())
				)
			);
		})
		.sort((a, b) => {
			if (sortCriteria === "epoch") {
				return a.epoch - b.epoch;
			} else if (sortCriteria === "fitness") {
				return b.bestFitness - a.bestFitness;
			} else {
				return 0;
			}
		});
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
		<CityMap cityMap={cityWeights} />
	</section>

	<GaSettings
		run={() => {
			runGa(
				gaSettings.gaSeed,
				gaSettings.once.targetEpochs,
				gaSettings.once.targetIndividuals,
				gaSettings.once.crossoverRate,
				gaSettings.once.mutationRate,
				gaSettings.once.crossoverMethod,
				gaSettings.once.mutationMethod
			);
		}}
		runAll={() => {
			runGaTryAll();
		}}
		bind:settings={gaSettings}
		progressMax={gaSettings.mode === GAMode.Once
			? gaSettings.once.targetEpochs
			: tryAllTargetEpochsTotal}
		progress={chromosomeProgress}
	/>

	{#if gaSettings.mode === GAMode.Once}
		<section>
			<SummaryCharts summaries={epochSummaries} targetEpochs={gaSettings.once.targetEpochs} />
		</section>
	{/if}
	<section>
		<h1 class="text-2xl font-bold mb-2">Epoch List</h1>
		<div class="flex flex-col gap-2">
			{#each epochSummaries as epochSummary}
				<EpochSummary
					{cityMap}
					{vehicles}
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

	<section>
		<!-- Filter and Sort Inputs -->
		<div class="flex gap-4 mb-4">
			<input
				type="text"
				class="border p-2"
				placeholder="Filter by keyword"
				bind:value={filterKeyword}
			/>
			<select class="border p-2" bind:value={sortCriteria}>
				<option value="epoch">Sort by Epoch</option>
				<option value="fitness">Sort by Best Fitness</option>
			</select>
		</div>
		<h1 class="text-2xl font-bold mb-2">Epoch List</h1>
		<div class="flex flex-col gap-2">
			{#each filteredAndSortedEpochSummaries as epochSummary}
				<EpochSummary
					{cityMap}
					{vehicles}
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
