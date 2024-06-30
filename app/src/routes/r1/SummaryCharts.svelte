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

	$: reversedSummaries = summaries.toReversed();

	$: chart1 = {
		labels: Array.from({ length: targetEpochs + 1 }, (_, i) => i),
		datasets: [
			{
				label: '',
				data: reversedSummaries.map((summary) => summary.bestFitness),
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
				label: '',
				data: reversedSummaries.map((summary) => summary.defectiveRate),
				fill: false,
				borderColor: 'rgb(192, 75, 192)',
				tension: 0.1
			}
		]
	};

	$: truncatePositiveEpochStart = reversedSummaries.findIndex((summary) => summary.bestFitness > 0);
	$: console.log(truncatePositiveEpochStart);

	// chart3 and chart4 only starts from positive epoch
	$: chart3 = {
		labels: Array.from(
			{ length: targetEpochs + 1 - truncatePositiveEpochStart },
			(_, i) => i + truncatePositiveEpochStart
		),
		datasets: [
			{
				label: '',
				data: reversedSummaries
					.slice(truncatePositiveEpochStart)
					.map((summary) => summary.bestFitness),
				fill: false,
				borderColor: 'rgb(75, 192, 192)',
				tension: 0.1
			}
		]
	};

	$: chart4 = {
		labels: Array.from(
			{ length: targetEpochs + 1 - truncatePositiveEpochStart },
			(_, i) => i + truncatePositiveEpochStart
		),
		datasets: [
			{
				label: '',
				data: reversedSummaries
					.slice(truncatePositiveEpochStart)
					.map((summary) => summary.defectiveRate),
				fill: false,
				borderColor: 'rgb(192, 75, 192)',
				tension: 0.1
			}
		]
	};
</script>

<section class="flex flex-col gap-4">
	<section class="flex gap-4">
		<div class="w-1/2">
			<h2 class="text-2xl font-bold mb-2">Best Fitness over Iteration</h2>
			<Line data={chart1} options={{}} height={120} />
		</div>
		<div class="w-1/2">
			<h2 class="text-2xl font-bold mb-2">Defective Rate over Iteration</h2>
			<Line data={chart2} options={{}} height={120} />
		</div>
	</section>
	<section class="flex gap-4">
		<div class="w-1/2">
			<h2 class="text-2xl font-bold mb-2">Best Fitness over Iteration (Truncated)</h2>
			<Line data={chart3} options={{}} height={120} />
		</div>
		<div class="w-1/2">
			<h2 class="text-2xl font-bold mb-2">Defective Rate over Iteration (Truncated)</h2>
			<Line data={chart4} options={{}} height={120} />
		</div>
	</section>
</section>
