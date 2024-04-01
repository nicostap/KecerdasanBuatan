<script lang="ts">
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
	import type { EpochSummaryData } from './+page.svelte';

	ChartJS.register(Title, LineElement, LinearScale, PointElement, CategoryScale);

	export let targetEpochs: number;
	export let summaries: EpochSummaryData[] = [];

	$: chart1 = {
		labels: Array.from({ length: targetEpochs + 1 }, (_, i) => i),
		datasets: [
			{
				label: 'Best Fitness over Epochs',
				data: summaries.map((summary) => summary.bestFitness).toReversed(),
				fill: false,
				borderColor: 'rgb(75, 192, 192)',
				tension: 0.1
			}
		]
	};

	$: chart2 = {
		labels: Array.from({ length: targetEpochs + 1 }, (_, i) => i),
		datasets: [
			{
				label: 'Defective Rate over Epochs',
				data: summaries.map((summary) => summary.defectiveRate).toReversed(),
				fill: false,
				borderColor: 'rgb(192, 75, 192)',
				tension: 0.1
			}
		]
	};
</script>

<section class="flex gap-4">
	<div class="w-1/2">
		<h2 class="text-2xl font-bold mb-2">Best Fitness over Epoch</h2>
		<Line data={chart1} options={{}} height={120} />
	</div>
	<div class="w-1/2">
		<h2 class="text-2xl font-bold mb-2">Defective Rate over Epoch</h2>
		<Line data={chart2} options={{}} height={120} />
	</div>
</section>
