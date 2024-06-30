<script lang="ts">
	import type { GraphData } from '@unovis/ts/data-models/graph';
	// @ts-ignore
	import { VisSingleContainer, VisGraph } from '@unovis/svelte';
	import type { GraphInputLink, GraphInputNode } from '@unovis/ts/types/graph';
	import { cityLabels } from '$lib/r1/Data';
	import type { GraphForceLayoutSettings } from '@unovis/ts';

	export let cityMap: number[][];

	// assume undirected
	$: links = cityMap
		.map((row, i) => row.map((v, j) => (i < j ? { source: i, target: j, value: v } : undefined)))
		.flat()
		.filter((l) => l !== undefined);

	$: data = {
		nodes: Array.from({ length: cityMap.length }, (_, i) => ({ id: i })),
		// @ts-ignore
		links: links.filter(({ value }) => value > 0)
	} satisfies GraphData<GraphInputNode, GraphInputLink>;

	function nodeLabel(n: GraphInputNode) {
		return cityLabels[n.id as any];
	}

	function linkLabel(l: GraphInputLink) {
		// @ts-ignore
		return { text: l.value, fontSize: '0.5em' };
	}

	const forceLayoutSettings: GraphForceLayoutSettings = {
		linkDistance: 150,
		charge: -1000,
		linkStrength: 0.7
	};
</script>


<section class="py-6 px-4">
	<h1 class="text-2xl font-bold mb-4">City Map</h1>
		<VisSingleContainer {data} height={512}>
			<VisGraph {nodeLabel} {linkLabel} {forceLayoutSettings} nodeSize={50} />
		</VisSingleContainer>
</section>
