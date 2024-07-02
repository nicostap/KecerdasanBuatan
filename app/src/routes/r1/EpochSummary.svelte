<script lang="ts">
	import box from '$lib/asset/box.png';
	import truck from '$lib/asset/cargo-truck.png';

	import { base } from '$app/paths';
	import { cityLabels } from '$lib/r1/Data';
	import type { MobilBox } from '$lib/r1/vehicles/MobilBox';
	import type { EpochSummaryData } from './+page.svelte';

	export let summary: EpochSummaryData;
	export let selected = false;
	export let vehicles: MobilBox[];
	export let cityMap: number[][];
	export let pathMap: number[][][];

	export let locations: any;

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

	function findLocationName(id: number) {
		for (const location of locations) {
			if (location.id == id) {
				if (location.name.length > 15) {
					return location.name.substring(0, 15) + '...';
				}
				return location.name;
			}
		}
	}

	function sendItems(individualIdx: number) {
		let data: any = {};
		for (let i = 0; i < summary.truckInfo[individualIdx].length; i++) {
			const truck = vehicles[i].id;
			const items = summary.truckInfo[individualIdx][i].map(([_, v]) => v.id);
			// console.log({ truck, items });
			if (truck) {
				data[truck] = items;
			}
		}
		fetch(`${base}/r1/api/deliver`, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
			// }).then((res) => {
			// 	// If 500, then show error message
			// 	if (res.status === 500) {
			// 		message = 'Something went wrong when updating vehicle';
			// 		timeoutMessage();
			// 	} else if (res.status === 200) {
			// 		message = 'Saved';
			// 		timeoutMessage();
			// 	} else {
			// 		message = 'Something went wrong';
			// 		timeoutMessage();
			// 	}
		});
	}
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
												<div class="relative flex flex-col flex-row items-center mr-4 w-1/4">
													<div
														class="absolute text-3xl text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-bold text-lg py-1"
														style="-webkit-text-stroke: 1px black; text-stroke: 1px black;"
													>
														{routeIdx + 1}
													</div>
													<img class="top-1/2 left-1/2" src={truck} alt="" />
												</div>

												<!-- Data container -->
												<div class="flex flex-col w-4/5">
													<div class="font-bold mb-1">Route :</div>
													<div class="flex flex-wrap items-center mb-2">
														{#each route as cityIdx, idx}
															<div class="px-2">
																{findLocationName(cityIdx + 1)}
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
																	class="absolute text-2xl text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-bold text-lg py-1"
																	style="-webkit-text-stroke: 1px black; text-stroke: 1px black;"
																>
																	{truckLoad[0] + 1}
																</div>
																<img class="top-1/2 left-1/2" width="32px" src={box} alt="" />
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
							<button
								class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
								on:click={() => sendItems(individualIdx)}
							>
								Use this result
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</section>
