<script lang="ts">
	import { cityLabels } from '$lib/r1/Data';
	import type { MobilBox } from '$lib/r1/vehicles/MobilBox';
	import type { EpochSummaryData } from './+page.svelte';

	export let summary: EpochSummaryData;
	export let selected = false;
	export let vehicles: MobilBox[];
	export let cityMap: number[][];

	const geneColors = [
		'bg-blue-200',
		'bg-green-200',
		'bg-yellow-200',
		'bg-red-200',
		'bg-orange-200',
		'bg-purple-200',
		'bg-pink-200',
		'bg-indigo-200',
		'bg-teal-200',
		'bg-cyan-200'
	];

	const props: [keyof EpochSummaryData, string][] = [
		['defectiveRate', 'Defective Rate'],
		['bestFitness', 'Best Fitness']
	];

	$: profitScores = summary.topIndividuals.map((individual, individualIdx) =>
		vehicles
			.filter((v, i) => summary.truckInfo[individualIdx][i])
			.map((vehicle, routeIdx) =>
				vehicle.getProfitScore(
					summary.truckInfo[individualIdx][routeIdx].map(([_, v]) => v),
					cityMap
				)
			)
	);
</script>

<section>
	<section
		class:bg-gray-200={selected}
		class:bg-gray-100={!selected}
		class="flex px-4 py-2 hover:bg-gray-300 cursor-pointer"
		on:click
		on:keypress
		role="button"
		tabindex={-1}
	>
		<div>
			<div class="font-bold">Epoch #{summary.epoch}</div>
			{#if summary.description}
				<div class="text-xs">{summary.description}</div>
			{/if}
		</div>
		<div class="ml-auto flex gap-2">
			<div class="text-xs">
				<span class="text-gray-500 font-semibold mr-1">Defective Rate</span>
				<span class="text-gray-500">{summary['defectiveRate'].toFixed(3)}</span>
			</div>
			<div class="text-xs">
				<span class="text-gray-500 font-semibold mr-1">Best Fitness</span>
				<span class="text-gray-500">{summary['bestFitness'].toFixed(2)}</span>
			</div>
		</div>
	</section>

	{#if selected}
		<section class="px-4 py-2 bg-blue-100">
			<h2 class="text-lg font-bold mb-2">Top Individuals</h2>
			<div class="flex flex-col">
				{#each summary.topIndividuals as individual, individualIdx}
					<div class="flex flex-col mb-4">
						<div class="flex">
							<div class="mr-2 font-bold">
								#{individualIdx + 1}
							</div>
							<div class="flex flex-wrap gap-2">
								{#each individual.genes as gene}
									<div
										class="px-2 {gene === -1
											? 'bg-gray-300'
											: geneColors[gene % geneColors.length]}"
									>
										{gene}
									</div>
								{/each}
							</div>
							<div class="ml-auto">
								Fitness: {individual.calculatedFitness.toFixed(2)}
							</div>
						</div>

						<div class="ml-4 mt-2">
							<h3 class="text-sm font-bold">Truck Routes</h3>
							<div class="flex flex-wrap gap-2">
								{#each individual.route as route, routeIdx}
									<div class="flex flex-col bg-blue-200 px-2 py-1">
										<div class="font-bold">Truck #{routeIdx}</div>
										<div class="flex flex-wrap">
											{#each route as cityIdx, idx}
												<div class="px-2">
													{cityLabels[cityIdx]}
												</div>
												{#if idx < route.length - 1}
													&rarr;
												{/if}
											{/each}
										</div>
										<div class="flex flex-wrap gap-1">
											{#each summary.truckInfo[individualIdx][routeIdx] as truckLoad}
												<div class="flex flex-col bg-gray-200 px-2">
													{truckLoad[0]}
												</div>
											{/each}
										</div>

										<div>
											Weight: {summary.truckInfo[individualIdx][routeIdx].reduce(
												(acc, val) => acc + val[1].getWeight(),
												0
											)} / {vehicles[routeIdx].capacityWeight}
										</div>

										<div>
											Fit score: {vehicles[routeIdx].getFitScore(
												summary.truckInfo[individualIdx][routeIdx].map(([, v]) => v)
											)}
										</div>

										<div>
											Profit from items: {profitScores[individualIdx][routeIdx][2].toFixed(2)}
										</div>

										<div>
											Courier costs: {profitScores[individualIdx][routeIdx][3].toFixed(2)}
										</div>

										<div>
											Net profit: {profitScores[individualIdx][routeIdx][1].toFixed(2)}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</section>
