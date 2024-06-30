<script lang="ts">
	import { cityLabels } from '$lib/r1/Data';
	import type { MobilBox } from '$lib/r1/vehicles/MobilBox';
	import type { EpochSummaryData } from './+page.svelte';

	export let summary: EpochSummaryData;
	export let selected = false;
	export let vehicles: MobilBox[];
	export let cityMap: number[][];
	export let pathMap: number[][][];

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
					cityMap,
					pathMap
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
	Generation #{summary.epoch}
	</section>

	{#if selected}
		<section class="px-4 py-2 bg-blue-100">
			<h2 class="text-lg font-bold mb-2">Top Picks</h2>
			<div class="flex flex-col">
				{#each summary.topIndividuals as individual, individualIdx}
					<div class="flex flex-col mb-4">
						<div class="ml-4 mt-2">
							<h3 class="text-sm font-bold">Option #{individualIdx + 1}</h3>
							<div class="flex flex-wrap gap-2">
								{#each individual.route as route, routeIdx}
									<div class="grid grid-cols-1 gap-4 p-4">
										<div class="flex flex-col bg-blue-200 p-4 rounded-lg shadow-md">
											<div class="flex items-start">
												<div class="relative flex flex-col flex-row items-center mr-4">
													<div
														class="absolute text-3xl text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-bold text-lg py-1" style="-webkit-text-stroke: 1px black; text-stroke: 1px black;"
													>
														{routeIdx}
													</div>
													<img class="top-1/2 left-1/2" width="100px" src="https://cdn.discordapp.com/attachments/746329602221146256/1257001438828302386/cargo-truck.png?ex=6682d150&is=66817fd0&hm=630bb962aaa3a6df8ddae896810fe8f0c16230c14fe59eee9f371fb5fc300ab9&">
												</div>

												<!-- Data container -->
												<div class="flex flex-col">
													<div class="font-bold mb-1">Route :</div>
													<div class="flex flex-wrap items-center mb-2">
														{#each route as cityIdx, idx}
															<div class="px-2">
																{cityLabels[cityIdx]}
															</div>
															{#if idx < route.length - 1}
																<span class="mx-1 text-blue-600">&rarr;</span>
															{/if}
														{/each}
													</div>

													<div class="flex flex-wrap gap-2 mb-2">
														<div class="font-bold mb-1">Items :</div>
														{#each summary.truckInfo[individualIdx][routeIdx] as truckLoad}
														<div class="relative flex flex-col flex-row items-center">
															<div
																class="absolute text-2xl text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-bold text-lg py-1" style="-webkit-text-stroke: 1px black; text-stroke: 1px black;"
															>
																{truckLoad[0]}
															</div>
															<img class="top-1/2 left-1/2" width="32px" src="https://cdn.discordapp.com/attachments/746329602221146256/1257004450971783299/box.png?ex=6682d41f&is=6681829f&hm=dc69e9c9c81dd151888f951d903b9fe8c4976d02186f144ee536361f1679fc6f&">
														</div>
														{/each}
													</div>

													<div class="text-gray-700 mb-1">
														<span class="font-semibold">Weight:</span>
														{summary.truckInfo[individualIdx][routeIdx].reduce(
															(acc, val) => acc + val[1].getWeight(),
															0
														)} / {vehicles[routeIdx].capacityWeight}
													</div>

													<div class="text-gray-700 mb-1">
														<span class="font-semibold">Profit from items:</span>
														{profitScores[individualIdx][routeIdx].income.toFixed(2)}
													</div>

													<div class="text-gray-700 mb-1">
														<span class="font-semibold">Courier costs:</span>
														{profitScores[individualIdx][routeIdx].outcome.toFixed(2)}
													</div>

													<div class="text-gray-700 mb-1">
														<span class="font-semibold">Net profit:</span>
														{profitScores[individualIdx][routeIdx].profit.toFixed(2)}
													</div>
												</div>
											</div>
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
