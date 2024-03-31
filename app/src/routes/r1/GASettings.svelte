<script lang="ts" context="module">
	export enum GAMode {
		Once,
		TryAll
	}
</script>

<script lang="ts">
	import {
		CrossoverType,
		CrossoverTypeLabels,
		MutationType,
		MutationTypeLabels
	} from '$lib/r1/Chromosome';

	interface SettingsOnce {
		targetEpochs: number;
		targetIndividuals: number;
		crossoverRate: number;
		crossoverUniformRate: number;
		mutationRate: number;
		crossoverMethod: CrossoverType;
		mutationMethod: MutationType;
	}

	interface Range {
		min: number;
		max: number;
		step: number;
	}

	interface SettingsTryAll {
		targetEpochs: Range;
		targetIndividuals: Range;
		crossoverRate: Range;
		crossoverUniformRate: Range;
		mutationRate: Range;
		crossoverMethod: CrossoverType[];
		mutationMethod: MutationType[];
	}

	interface Settings {
		mode: GAMode;
		gaSeed: string;
		once: SettingsOnce;
		tryAll: SettingsTryAll;
	}

	export let settings: Settings = {
		mode: GAMode.Once,
		gaSeed: '1415926535897932384626433832795028841971',
		once: {
			targetEpochs: 10,
			targetIndividuals: 500,
			crossoverRate: 0.7,
			crossoverUniformRate: 0.5,
			mutationRate: 0.02,
			crossoverMethod: CrossoverType.Uniform,
			mutationMethod: MutationType.AdditionSubtractionInteger
		},
		tryAll: {
			targetEpochs: { min: 10, max: 100, step: 10 },
			targetIndividuals: { min: 100, max: 1000, step: 100 },
			crossoverRate: { min: 0.5, max: 0.9, step: 0.1 },
			crossoverUniformRate: { min: 0.1, max: 0.9, step: 0.1 },
			mutationRate: { min: 0.01, max: 0.1, step: 0.01 },
			crossoverMethod: [CrossoverType.Uniform],
			mutationMethod: [MutationType.AdditionSubtractionInteger, MutationType.RandomInteger]
		}
	};

	const editableFields: {
		name: keyof Omit<SettingsOnce | SettingsTryAll, 'crossoverMethod' | 'mutationMethod'>;
		label: string;
		min: number;
		max: number;
		step: number;
	}[] = [
		{ name: 'targetEpochs', label: 'Target Epochs', min: 1, max: 1000, step: 1 },
		{ name: 'targetIndividuals', label: 'Target Individuals', min: 1, max: 10000, step: 1 },
		{ name: 'crossoverRate', label: 'Crossover Rate', min: 0, max: 1, step: 0.01 },
		{ name: 'crossoverUniformRate', label: 'Uniform Crossover Rate', min: 0, max: 1, step: 0.01 },
		{ name: 'mutationRate', label: 'Mutation Rate', min: 0, max: 1, step: 0.01 }
	];

	export let run: () => void = () => {};
	export let progress: number = 0;
	export let progressMax: number = 0;
</script>

<section>
	<h1 class="text-2xl font-bold mb-2">GA Settings</h1>
	<div class="flex flex-col gap-2 bg-gray-200 p-4">
		<div>
			Mode:
			<button
				class="bg-gray-400 px-2"
				class:bg-orange-400={settings.mode === GAMode.Once}
				on:click={() => {
					settings.mode = GAMode.Once;
				}}
			>
				Run Once
			</button>
			<button
				class="bg-gray-400 px-2"
				class:bg-orange-400={settings.mode === GAMode.TryAll}
				on:click={() => {
					settings.mode = GAMode.TryAll;
				}}
			>
				Try All
			</button>
		</div>
		<div>
			<label>
				GA Seed:
				<input type="text" class="px-2" bind:value={settings.gaSeed} />
			</label>
		</div>

		{#if settings.mode === GAMode.Once}
			{#each editableFields as { name, label, min, max, step }}
				<label>
					{label}:
					<input type="number" {min} {max} {step} class="px-2" bind:value={settings.once[name]} />
				</label>
			{/each}

			<label>
				Crossover Type:
				<select
					class="px-2"
					value={String(settings.once.crossoverMethod)}
					on:change={(e) => {
						// @ts-ignore
						settings.once.crossoverMethod = Number.parseInt(e.target.value);
					}}
				>
					{#each Object.entries(CrossoverTypeLabels) as [type, label]}
						<option value={type}>{label}</option>
					{/each}
				</select>
			</label>

			<label>
				Mutation Type:
				<select
					class="px-2"
					value={String(settings.once.mutationMethod)}
					on:change={(e) => {
						// @ts-ignore
						settings.once.mutationMethod = Number.parseInt(e.target.value);
					}}
				>
					{#each Object.entries(MutationTypeLabels) as [type, label]}
						<option value={type}>{label}</option>
					{/each}
				</select>
			</label>
		{:else}
			{#each editableFields as { name, label, min, max, step }}
				<div class="flex pb-0.5">
					{label}:
					<div class="flex gap-1 pl-1">
						<input
							type="number"
							{min}
							{max}
							{step}
							title="{label} min"
							class="px-2 w-20"
							bind:value={settings.tryAll[name].min}
						/>
						<input
							type="number"
							{min}
							{max}
							{step}
							title="{label} max"
							class="px-2 w-20"
							bind:value={settings.tryAll[name].max}
						/>
						<input
							type="number"
							{min}
							{max}
							{step}
							title="{label} step"
							class="px-2 w-20"
							bind:value={settings.tryAll[name].step}
						/>
					</div>
				</div>
			{/each}

			<label>
				Crossover Type:
				<select
					class="px-2"
					value={String(settings.once.crossoverMethod)}
					on:change={(e) => {
						// @ts-ignore
						settings.once.crossoverMethod = Number.parseInt(e.target.value);
					}}
				>
					{#each Object.entries(CrossoverTypeLabels) as [type, label]}
						<option value={type}>{label}</option>
					{/each}
				</select>
			</label>

			<label>
				Mutation Type:
				<select
					class="px-2"
					value={String(settings.once.mutationMethod)}
					on:change={(e) => {
						// @ts-ignore
						settings.once.mutationMethod = Number.parseInt(e.target.value);
					}}
				>
					{#each Object.entries(MutationTypeLabels) as [type, label]}
						<option value={type}>{label}</option>
					{/each}
				</select>
			</label>
		{/if}

		<div class="flex">
			<button class="bg-blue-200 px-2" on:click={run}>Clear & Run</button>
			<div class="ml-auto">
				{#if progress !== 0 && progress !== progressMax}
					<div class="flex gap-2">
						<div class="w-20">Progress:</div>
						<div>{progress}/{progressMax} ({Math.floor((progress / progressMax) * 100)}%)</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
