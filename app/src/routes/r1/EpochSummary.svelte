<script lang="ts">
	import { cityLabels } from '$lib/r1/Data';
	import type { EpochSummaryData } from './+page.svelte';

	export let summary: EpochSummaryData;
	export let selected = false;

	const props: [keyof EpochSummaryData, string][] = [
		['defectiveRate', 'Defective Rate'],
		['bestFitness', 'Best Fitness']
	];
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
		<div>Epoch #{summary.epoch}</div>
		<div class="ml-auto flex gap-2">
			{#each props as [key, label]}
				<div class="text-xs">
					<span class="text-gray-500 font-semibold mr-1">{label}</span>
					<span class="text-gray-500">{summary[key]}</span>
				</div>
			{/each}
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
										class:bg-gray-300={gene === -1}
										class:bg-blue-200={gene === 0}
										class:bg-green-200={gene === 1}
										class:bg-yellow-200={gene === 2}
										class:bg-red-200={gene === 3}
										class="px-2"
									>
										{gene}
									</div>
								{/each}
							</div>
							<div class="ml-auto">
								Fitness: {individual.calculatedFitness}
							</div>
						</div>

						<div class="ml-4 mt-2">
							<h3 class="text-sm font-bold">Truck Routes</h3>
							<div class="flex flex-wrap">
								{#each individual.route as route, routeIdx}
									<div class="flex flex-col mr-4 bg-blue-200 px-2 py-2">
										<div class="font-bold">Truck #{routeIdx}</div>
										<div class="flex flex-wrap gap-2">
											{#each route as cityIdx, idx}
												<div class="px-2">
													{cityLabels[cityIdx]}
												</div>
												{#if idx < route.length - 1}
													&rarr;
												{/if}
											{/each}
										</div>
										<div></div>
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
