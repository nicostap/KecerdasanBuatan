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
	// import { cityLabels } from '$lib/r1/Data';
	import SummaryCharts from './SummaryCharts.svelte';
	import CityMap from './CityMap.svelte';
	import { createAdjacencyMatrix } from '$lib/map/AdjacencyMatrix';
	import type { PageData } from './$types';
	import Map from './Map.svelte';
	import { base } from '$app/paths';

	export let data: PageData;

	$: ({ locations, items, trucks } = data);

	const defaultMobilBoxParams: ConstructorParameters<typeof MobilBox> = [
		100, 100, 100, 100, 0.8, 1000, 10000, 0.1
	];

	const defaultVehicleLoadParams: ConstructorParameters<typeof VehicleLoad> = [
		10,
		10,
		10,
		10,
		1,
		1,
		false
	];

	// This may cause so many race conditions
	let vehicles = data.trucks.map((truck) => MobilBox.fromDatabaseObject(truck));

	// let vehicleLoad: VehicleLoad[] = [];
	let vehicleLoad = data.items.map((item) => VehicleLoad.fromDatabaseObject(item));

	// const cityWeights = [
	// 	[0, 61, 35, 0, 91, 12],
	// 	[61, 0, 0, 0, 0, 90],
	// 	[35, 0, 0, 100, 41, 0],
	// 	[0, 0, 100, 0, 23, 54],
	// 	[91, 0, 41, 23, 0, 0],
	// 	[12, 90, 0, 54, 0, 0]
	// ];

	const cityWeights = createAdjacencyMatrix(data.locations);

	const mapResult = generateDijkstra(cityWeights);
	const cityMap = mapResult.distances;
	const pathMap = mapResult.paths;

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
														// // v.status,
														v.mustDeliver,
														v.id
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

				let calculation = vehicles[i].getProfitScore(load, cityMap, pathMap);
				chromosome.calculatedFitness += calculation.profit;
				chromosome.route.push(calculation.route);
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

					let calculation = vehicles[j].getProfitScore(load, cityMap, pathMap);
					chromosomes[i].route.push(calculation.route);
					chromosomes[i].calculatedFitness += calculation.profit;
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
	function clearEpochSummaries() {
		// Logic to clear epoch summaries
		epochSummaries = [];
	}

	function runGa2() {
		// Logic to run GA
		runGa(
			gaSettings.gaSeed,
			gaSettings.once.targetEpochs,
			gaSettings.once.targetIndividuals,
			gaSettings.once.crossoverRate,
			gaSettings.once.mutationRate,
			gaSettings.once.crossoverMethod,
			gaSettings.once.mutationMethod
		);
	}

	function deleteAllVehicles() {
		// Delete all vehicles via API
		fetch(`${base}/r1/api/vehicles`, {
			method: 'DELETE',
			body: JSON.stringify(vehicles.filter((v) => v.id !== undefined).map((v) => v.id)),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// Empty the vehicles array
		vehicles = [];
	}

	//Script UI

	let showGenerator = false;
	let showItemGenerator = false;

	function toggleGenerator() {
		showGenerator = !showGenerator;
	}

	function addVehicle(existingVehicle?: MobilBox) {
		const newVehicle = existingVehicle ?? new MobilBox(...defaultMobilBoxParams);
		vehicles = [...vehicles, newVehicle];

		// Add new vehicle via API, then update the the new vehicle ID
		fetch(`${base}/r1/api/vehicles`, {
			method: 'POST',
			body: JSON.stringify(newVehicle.toObject()),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((res) => res.json())
			.then((dbVehicle) => {
				newVehicle.id = dbVehicle.id;
				vehicles = vehicles;
			});
	}

	function toggleItemGenerator() {
		showItemGenerator = !showItemGenerator;
	}

	function deleteAllItems() {
		fetch(`${base}/r1/api/vehicleLoad`, {
			method: 'DELETE',
			body: JSON.stringify(vehicleLoad.filter((v) => v.id !== undefined).map((v) => v.id)),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		vehicleLoad = [];
	}

	function addVehicleLoad(existingVehicleLoad?: VehicleLoad) {
		const newVehicleLoad = existingVehicleLoad ?? new VehicleLoad(...defaultVehicleLoadParams);
		vehicleLoad = [...vehicleLoad, newVehicleLoad];

		// Add new vehicleLoad via API, then update the the new vehicleLoad ID
		fetch(`${base}/r1/api/vehicleLoad`, {
			method: 'POST',
			body: JSON.stringify(newVehicleLoad.toObject()),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((res) => res.json())
			.then((dbVehicleLoad) => {
				newVehicleLoad.id = dbVehicleLoad.id;
				vehicleLoad = vehicleLoad;
			});
	}

	let selectedSection = localStorage.getItem('selectedSection') || 'Truk';

	function handleNavClick(section: string): void {
		selectedSection = section;
		localStorage.setItem('selectedSection', section);
	}

	// function useResult(epochSummary: EpochSummaryData) {
	// 	fetch(`${base}/r1/api/epoch/update-result`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		body: JSON.stringify({
	// 			epochId: epochSummary.epoch
	// 		})
	// 	})
	// 		.then((response) => {
	// 			if (response.ok) {
	// 				alert('Result used successfully!');
	// 			} else {
	// 				alert('Failed to use result.');
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			console.error('Error using result:', error);
	// 			alert('Error occurred while using result.');
	// 		});
	// }
</script>

<nav class="bg-blue-900 text-gray-200 py-4" style="z-index: 1002;">
	<div class="container mx-20 px-2">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-6">
				<a
					href="#Truk"
					class:active={selectedSection === 'Truk'}
					class="nav-link"
					on:click|preventDefault={() => handleNavClick('Truk')}
				>
					Truk
				</a>
				<a
					href="#Barang"
					class:active={selectedSection === 'Barang'}
					class="nav-link"
					on:click|preventDefault={() => handleNavClick('Barang')}
				>
					Barang
				</a>
				<a
					href="#CityMap"
					class:active={selectedSection === 'CityMap'}
					class="nav-link"
					on:click|preventDefault={() => handleNavClick('CityMap')}
				>
					City Map
				</a>
				<a
					href="#SettingGA"
					class:active={selectedSection === 'SettingGA'}
					class="nav-link"
					on:click|preventDefault={() => handleNavClick('SettingGA')}
				>
					Setting GA
				</a>
				<a
					href="#Charts"
					class:active={selectedSection === 'Charts'}
					class="nav-link"
					on:click|preventDefault={() => handleNavClick('Charts')}
				>
					Charts
				</a>
			</div>
		</div>
	</div>
</nav>

<main
	class="p-4 flex flex-col gap-4 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg shadow-lg"
>
	{#if selectedSection === 'Truk'}
		<section
			id="Truk"
			class="my-4 p-5 bg-gradient-to-r from-green-200 to-green-100 border-2 border-blue-300 rounded-lg shadow-lg"
		>
			<h1 class="text-3xl font-bold text-red-900 mb-6">Manage Vehicles</h1>
			<button
				class="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
				on:click={toggleGenerator}
			>
				{showGenerator ? 'Hide Generator' : 'Generator'}
			</button>

			<button
				class="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
				on:click={deleteAllVehicles}
			>
				Delete All Vehicles
			</button>

			<div style="height: 20px;"></div>

			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each vehicles as vehicle, idx}
					<div class="flex flex-col justify-center items-center">
						<Truck
							idx={idx + 1}
							bind:vehicle
							on:delete={() => {
								vehicles = vehicles.filter((v) => v !== vehicle);

								// Delete the vehicle via API
								fetch(`${base}/r1/api/vehicles`, {
									method: 'DELETE',
									body: JSON.stringify([vehicle.id]),
									headers: {
										'Content-Type': 'application/json'
									}
								});
							}}
							on:duplicate={(e) => addVehicle(e.detail.copy())}
						/>
					</div>
				{/each}
				<button
					class="bg-gradient-to-br from-blue-400 to-blue-500 hover:from-green-500 hover:to-blue-600 py-3 px-6 text-white font-semibold text-lg hover:shadow-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
					on:click={() => addVehicle()}
				>
					+Add Vehicle
				</button>
			</div>
		</section>

		<!-- Popup for generator -->
		{#if showGenerator}
			<!-- Popup overlay -->
			<div class="popup-overlay">
				<div class="popup-content bg-white rounded-lg shadow-lg p-6">
					<!-- Include the TruckSeed component here -->
					<TruckSeed bind:vehicles />
					<div class="mt-4">
						<button
							class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded-md shadow-md font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
							on:click={toggleGenerator}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		{/if}
	{/if}

	{#if selectedSection === 'Barang'}
		<section
			id="Barang"
			class="my-4 p-5 bg-gradient-to-r from-yellow-200 to-yellow-100 border-2 border-orange-300 rounded-lg shadow-lg"
		>
			<h1 class="text-3xl font-bold text-red-900 mb-6">Manage Items</h1>
			<button
				class="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400"
				on:click={toggleItemGenerator}
			>
				{showItemGenerator ? 'Hide Item Generator' : 'Item Generator'}
			</button>

			<button
				class="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400"
				on:click={deleteAllItems}
			>
				Delete All Items
			</button>

			<div style="height: 20px;"></div>

			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each vehicleLoad as item, idx}
					<div class="flex flex-col justify-center items-center">
						<!-- svelte-ignore illegal-attribute-character -->
						<Barang
							idx={idx + 1}
							bind:item
							{locations}
							{cityMap}
							on:delete={() => {
								vehicleLoad = vehicleLoad.filter((v) => v !== item);

								// Delete the vehicle via API
								fetch(`${base}/r1/api/vehicleLoad`, {
									method: 'DELETE',
									body: JSON.stringify([item.id]),
									headers: {
										'Content-Type': 'application/json'
									}
								});
							}}
							on:duplicate={(e) => addVehicleLoad(e.detail.copy())}
						/>
					</div>
				{/each}
				<button
					class="bg-gradient-to-br from-orange-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 py-3 px-6 text-white font-semibold text-lg hover:shadow-lg rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
					on:click={() => addVehicleLoad()}
				>
					+Add Item
				</button>
			</div>
		</section>

		<!-- Popup for item generator -->
		{#if showItemGenerator}
			<!-- Popup overlay -->
			<div class="popup-overlay">
				<div class="popup-content bg-white rounded-lg shadow-lg p-6">
					<!-- Include the BarangSeed component here -->
					<BarangSeed bind:vehicleLoad />
					<div class="mt-4">
						<button
							class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded-md shadow-md font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
							on:click={toggleItemGenerator}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		{/if}
	{/if}

	{#if selectedSection === 'CityMap'}
		<section id="CityMap" class="py-6 px-4">
			<div class="bg-[bisque] border-2 border-orange-300 rounded-lg shadow-lg p-4">
				<!-- <CityMap cityMap={cityWeights} /> -->
				<Map {locations} />
			</div>
		</section>
	{/if}

	{#if selectedSection === 'SettingGA'}
		<section id="SettingGA">
			<GaSettings
				bind:settings={gaSettings}
				progressMax={gaSettings.mode === GAMode.Once
					? gaSettings.once.targetEpochs
					: tryAllTargetEpochsTotal}
				progress={chromosomeProgress}
			/>
		</section>
	{/if}

	{#if selectedSection === 'Charts' && gaSettings.mode === GAMode.Once}
		<section id="Charts" class="mt-8">
			<div class="mb-6">
				<div class="bg-white rounded-lg shadow-lg p-4">
					<button class="btn-clear" on:click={clearEpochSummaries}>
						<svg
							class="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path></svg
						>
						Clear
					</button>
					<button class="btn-run" on:click={runGa2}>
						<svg
							class="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 12h14M12 5l7 7-7 7"
							></path></svg
						>
						Run
					</button>
					<SummaryCharts summaries={epochSummaries} targetEpochs={gaSettings.once.targetEpochs} />
				</div>
				<div class="p-4"></div>

				<!-- Epoch List Section -->
				<section>
					<div class="bg-white rounded-lg shadow-lg p-4">
						<div class="mb-6">
							<h2 class="text-2xl font-bold text-gray-800 mb-4">Epoch List</h2>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{#each epochSummaries as epochSummary}
								<div>
									<EpochSummary
										{cityMap}
										{vehicles}
										{pathMap}
										summary={epochSummary}
										selected={epochSummary.epoch === selectedEpoch}
										on:click={() => {
											selectedEpoch =
												epochSummary.epoch === selectedEpoch ? -1 : epochSummary.epoch;
										}}
										{locations}
									/>
								</div>
							{/each}
						</div>
					</div>
				</section>
			</div>
		</section>
	{/if}
</main>

<style>
	.nav-link {
		padding: 1rem;
		border-bottom: 2px solid transparent;
		transition: border-color 0.3s ease;
		font-size: 19px;
		text-decoration: none;
		color: #ffffff;
	}

	.nav-link:hover {
		border-color: #4a4a4a;
	}

	.nav-link.active {
		border-color: #ff0000;
		font-weight: bold;
		color: #ff0000;
	}

	nav {
		position: sticky;
		top: 0;
		z-index: 1000;
		background-color: rgb(1, 20, 49);
		transition: background-color 0.3s ease;
	}
	.popup-overlay {
		z-index: 2002;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.popup-content {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		padding: 20px;
	}
	.btn-clear {
		background-color: #4299e1; /* Blue background */
		color: #ffffff;
		padding: 0.75rem 1.5rem;
		border-radius: 0.25rem;
		transition: background-color 0.3s ease;
	}

	.btn-clear:hover {
		background-color: #3182ce; /* Darker blue on hover */
	}

	.btn-run {
		background-color: #48bb78; /* Green background */
		color: #ffffff;
		padding: 0.75rem 1.5rem;
		border-radius: 0.25rem;
		transition: background-color 0.3s ease;
	}

	.btn-run:hover {
		background-color: #38a169; /* Darker green on hover */
	}
</style>
