import { wait } from '$lib/kb/libs';
import { CrossoverType, MutationType, Chromosome } from '$lib/r1/Chromosome';
import { Random } from '$lib/r1/Random';
import { VehicleLoad } from '$lib/r1/VehicleLoad';
import { MobilBox } from '$lib/r1/vehicles/MobilBox';
import type { EpochSummaryData } from './+page.svelte';
import type { GASettings } from './GASettings.svelte';

let vehicles: MobilBox[] = [];
let vehicleLoad: VehicleLoad[] = [];

const cityMap = [
	[0, 61, 35, 0, 91, 12],
	[61, 0, 0, 0, 0, 90],
	[35, 0, 0, 100, 41, 0],
	[0, 0, 100, 0, 23, 54],
	[91, 0, 41, 23, 0, 0],
	[12, 90, 0, 54, 0, 0]
];

onmessage = async (e) => {
	const data = e.data;

	// Initialize all
	const vehicleMessage = data.vehicles;
	const vehicleLoadMessage = data.vehicleLoad;

	const runGaParams = data.runGaParams;

	vehicles.length = 0;
	vehicleLoad.length = 0;

	vehicles = vehicleMessage.map(
		({
			capacityWidth,
			capacityHeight,
			capacityDepth,
			capacityWeight,
			packingFactor,
			pricePerKm,
			fuelPricePerLiter,
			fuelConsumptionPerKm
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}: any) =>
			new MobilBox(
				capacityWidth,
				capacityHeight,
				capacityDepth,
				capacityWeight,
				packingFactor,
				pricePerKm,
				fuelPricePerLiter,
				fuelConsumptionPerKm
			)
	);

	vehicleLoad = vehicleLoadMessage.map(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		({ width, height, depth, weight, originCity, destinationCity, mustDeliver }: any) =>
			new VehicleLoad(width, height, depth, weight, originCity, destinationCity, mustDeliver)
	);

	await runGa(
		runGaParams.gaSeed,
		runGaParams.targetEpochs,
		runGaParams.targetIndividuals,
		runGaParams.crossoverRate,
		runGaParams.mutationRate,
		runGaParams.crossoverMethod,
		runGaParams.mutationMethod,
		runGaParams.fitScoreMultiplier,
		runGaParams.gaSettings
	);
};

async function runGa(
	gaSeed: string,
	targetEpochs: number,
	targetIndividuals: number,
	crossoverRate: number,
	mutationRate: number,
	crossoverMethod: CrossoverType,
	mutationMethod: MutationType,
	fitScoreMultiplier: number,
	gaSettings: GASettings
) {
	let epochSummaries: EpochSummaryData[] = [];

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

	// Seed
	const random = Random.fromString(gaSeed);
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
			chromosome.calculatedFitness += fitScoreMultiplier * fitScore;
			isDefective ||= fitScore !== 0;

			const calculation = vehicles[i].getProfitScore(load, cityMap);
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

	// Add to epoch summaries
	epochSummaries = [];
	addSummary(chromosomes, 0);

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

			const offspring_count = random.nextIntInclusive(1, 2);
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

				const calculation = vehicles[j].getProfitScore(load, cityMap);
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

		// Add to epoch summaries
		addSummary(chromosomes, gen + 1);

		postMessage({ chromosomeProgress: 1 });
	}

	postMessage({ epochSummaries });
}
