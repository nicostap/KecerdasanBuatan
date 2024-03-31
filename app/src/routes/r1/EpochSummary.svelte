<script lang="ts">
	import { cityLabels } from '$lib/r1/Data';
	import type { EpochSummaryData } from './+page.svelte';

	export let summary: EpochSummaryData;
	export let selected = false;

	const props: [keyof EpochSummaryData, string][] = [['bestFitness', 'Best Fitness']];
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
					<div class="flex flex-col mb-2">
						<div class="flex">
							<div class="mr-2">
								#{individualIdx + 1}
							</div>
							<div class="flex flex-wrap gap-2">
								{#each individual.genes as gene}
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
							<div class="ml-auto">
								Fitness: {individual.calculatedFitness}
							</div>
						</div>

						<div class="ml-4">
							<h3 class="text-sm font-bold">Truck Routes</h3>
							{#each individual.route as route, routeIdx}
								<div class="flex">
									<div class="mr-2">
										#{routeIdx + 1}
									</div>
									<div class="flex flex-wrap gap-2">
										{#each route as cityIdx}
											<div class="px-2 py-1">
												{cityLabels[cityIdx]}
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</section>
