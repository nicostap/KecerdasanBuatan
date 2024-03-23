<script lang="ts">
	import type { EpochSummaryData } from './+page.svelte';

	export let summary: EpochSummaryData;

	const props: [keyof EpochSummaryData, string][] = [['bestFitness', 'Best Fitness']];
</script>

<section class="flex px-4 py-2 bg-gray-200">
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
