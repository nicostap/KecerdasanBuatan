<script lang="ts">
	import { mutate, randomInteger, uniformCrossover, wait } from '$lib/kb/libs';
	import { Chrosmosome, compareByFitness, items } from '$lib/kb/script';
	import { Line } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	} from 'chart.js';

	import { onMount } from 'svelte';
	import '../app.css';

	export const prerender = false;
	export const ssr = false;

	ChartJS.register(Title, LineElement, LinearScale, PointElement, CategoryScale);

	const targetEpochs = 10;

	const chartData = {
		labels: Array.from({ length: targetEpochs + 1 }, (_, i) => i),
		datasets: [
			{
				label: 'Best Fitness',
				data: [] as number[],
				fill: false,
				borderColor: 'rgb(75, 192, 192)',
				tension: 0.1
			}
		]
	};

	interface EpochData {
		epoch: number;
		bestFitness: number;
		bestChromosome: Chrosmosome;
	}

	let epochSummaries: EpochData[] = [];
	let epochsElapsed = 0;

	onMount(async () => {
		let chrosmosomes = [];

		// Generate initial population
		while (chrosmosomes.length < 500) {
			const data = [];
			for (let i = 0; i < items.length; i++) {
				data.push(randomInteger(0, 3));
			}

			const chrosmosome = new Chrosmosome(data);

			if (chrosmosome.cekMuat()) {
				chrosmosomes.push(chrosmosome);
			}
		}

		// Calculate initial fitness values
		for (let i = 0; i < chrosmosomes.length; i++) chrosmosomes[i].setFitness();
		chrosmosomes.sort(compareByFitness);
		epochSummaries.push({
			epoch: 0,
			bestFitness: chrosmosomes[chrosmosomes.length - 1].fitness,
			bestChromosome: chrosmosomes[chrosmosomes.length - 1]
		});

		chartData.datasets[0].data.push(chrosmosomes[chrosmosomes.length - 1].fitness);
		// hacky trigger reactivity
		chartData.datasets[0].data = chartData.datasets[0].data;

		// console.log(chrosmosomes);

		// Run the genetic algorithm
		for (let gen = 0; gen < targetEpochs; gen++) {
			const new_chrosmosomes = [];
			new_chrosmosomes.push(new Chrosmosome(chrosmosomes[chrosmosomes.length - 1].data));

			while (new_chrosmosomes.length < chrosmosomes.length) {
				let first_pick, second_pick;

				first_pick = randomInteger(0, (chrosmosomes.length * (chrosmosomes.length + 1)) / 2.0);
				for (let i = 0; i < chrosmosomes.length; i++) {
					if (((i + 1) * (i + 2)) / 2.0 >= first_pick) {
						first_pick = i;
						break;
					}
				}
				second_pick = randomInteger(0, (chrosmosomes.length * (chrosmosomes.length + 1)) / 2.0);
				for (let i = 0; i < chrosmosomes.length; i++) {
					if (((i + 1) * (i + 2)) / 2.0 >= second_pick) {
						second_pick = i;
						break;
					}
				}

				const offspring_count = randomInteger(0, 2);

				for (let i = 0; i < offspring_count; i++) {
					const offspring = uniformCrossover(
						chrosmosomes[first_pick].data,
						chrosmosomes[second_pick].data
					);
					const preMutation = offspring.slice();

					let mutated = false;
					if (randomInteger(1, 10) <= 3) {
						mutate(offspring, 0, 3);
						mutated = true;
					}

					const chrosmosome = new Chrosmosome(offspring);
					chrosmosome.parentChromosomes = [chrosmosomes[first_pick], chrosmosomes[second_pick]];
					if (mutated) chrosmosome.preMutatedState = preMutation;

					if (chrosmosome.cekMuat()) {
						new_chrosmosomes.push(chrosmosome);
					}
				}
			}
			chrosmosomes = new_chrosmosomes;
			for (let i = 0; i < chrosmosomes.length; i++) chrosmosomes[i].setFitness();
			chrosmosomes.sort(compareByFitness);
			// console.log(chrosmosomes);

			await wait(1);

			// Save the best fitness value and chromosome for this epoch
			epochSummaries.push({
				epoch: gen + 1,
				bestFitness: chrosmosomes[chrosmosomes.length - 1].fitness,
				bestChromosome: chrosmosomes[chrosmosomes.length - 1]
			});

			chartData.datasets[0].data.push(chrosmosomes[chrosmosomes.length - 1].fitness);
			// hacky trigger reactivity
			chartData.datasets[0].data = chartData.datasets[0].data;

			epochsElapsed++;
			epochSummaries = epochSummaries;
		}
		// console.log(chrosmosomes[chrosmosomes.length - 1]);
	});

	const settingParams = [
		'dimensix',
		'dimensiy',
		'dimensiz',
		'batasDimensiKecil',
		'batasDimensiMenengah',
		'daya_angkut',
		'fuel_ratio',
		'packing_f',
		'upahPerKM',
		'hargaBensin',
		'hargaKecil',
		'hargaMenengah',
		'hargaBesar'
	] as (keyof typeof Chrosmosome)[];
</script>

<main class="p-4">
	<div>
		<b>Epochs Elapsed:</b>
		{epochsElapsed}
	</div>
	<br />

	<Line data={chartData} options={{}} height={80} />

	<div class="flex gap-4">
		<div>
			<h1 class="font-bold text-xl">Items</h1>
			<table class="border">
				<thead>
					<tr>
						<th class="p-1 px-2 border">ID</th>
						<th class="p-1 px-2 border">Volume</th>
						<th class="p-1 px-2 border">Kota Tujuan</th>
					</tr>
				</thead>
				{#each items as item}
					<tr>
						<td class="p-1 px-2 border">{item.id}</td>
						<td class="p-1 px-2 border">{item.getVolume()}m<sup>3</sup></td>
						<td class="p-1 px-2 border">{item.kota_tujuan}</td>
					</tr>
				{/each}
			</table>
		</div>
		<div>
			<h1 class="font-bold text-xl">Settings</h1>
			<table class="border">
				<thead>
					<th class="p-1 px-2 border">Name</th>
					<th class="p-1 px-2 border">Value</th>
				</thead>
				<tbody>
					{#each settingParams as setting}
						<tr>
							<td class="p-1 px-2 border">{setting}</td>
							<td class="p-1 px-2 border">{Chrosmosome[setting]}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<h1 class="font-bold text-xl">Epoch Summary</h1>
	{#each epochSummaries as epochSummary}
		<div class="mb-4">
			<b>Epoch {epochSummary.epoch}</b>: Best fitness = {epochSummary.bestFitness}
			<div>
				<b>Best Chromosome:</b>
				<div class="flex border-1">
					{#each epochSummary.bestChromosome.data as gene}
						<div
							class:bg-blue-200={gene === 0}
							class:bg-green-200={gene === 1}
							class:bg-yellow-200={gene === 2}
							class:bg-red-200={gene === 3}
							class="px-2 py-1"
						>
							{gene}
						</div>
					{/each}
				</div>
				<b>Chromosome Parents:</b>
				<div>
					{#each epochSummary.bestChromosome.parentChromosomes as parentChromosome, parentIdx}
						<div class="flex border-1">
							<div class="pr-2">Parent {parentIdx + 1}:</div>
							{#each parentChromosome.data as gene}
								<div
									class:bg-blue-200={gene === 0}
									class:bg-green-200={gene === 1}
									class:bg-yellow-200={gene === 2}
									class:bg-red-200={gene === 3}
									class="px-2 py-1"
								>
									{gene}
								</div>
							{/each}
						</div>
					{/each}

					{#if epochSummary.bestChromosome.preMutatedState !== null}
						<div class="flex">
							<b>Before Mutation:</b>
							<div class="flex border-1">
								{#each epochSummary.bestChromosome.preMutatedState as gene}
									<div
										class:bg-blue-200={gene === 0}
										class:bg-green-200={gene === 1}
										class:bg-yellow-200={gene === 2}
										class:bg-red-200={gene === 3}
										class="px-2 py-1"
									>
										{gene}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/each}
</main>
