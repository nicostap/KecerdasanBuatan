<script lang="ts" context="module">
	export enum GAMode {
		Once,
		TryAll
	}

	export interface Range {
		min: number;
		max: number;
		step: number;
	}

	export interface SettingsOnce {
		targetEpochs: number;
		targetIndividuals: number;
		crossoverRate: number;
		crossoverUniformRate: number;
		mutationRate: number;
		crossoverMethod: CrossoverType;
		mutationMethod: MutationType;
	}

	export interface SettingsTryAll {
		targetEpochs: number;
		targetIndividuals: Range;
		crossoverRate: Range;
		crossoverUniformRate: Range;
		mutationRate: Range;
		crossoverMethod: CrossoverType[];
		mutationMethod: MutationType[];
	}

	export interface GASettings {
		mode: GAMode;
		gaSeed: string;
		once: SettingsOnce;
		tryAll: SettingsTryAll;
		fitScoreMultiplier: number;
		delayedPenalty: number;
		mustDeliverPenalty: number;
	}
</script>

<script lang="ts">
	import {
		CrossoverType,
		CrossoverTypeLabels,
		MutationType,
		MutationTypeLabels
	} from '$lib/r1/Chromosome';

	export let settings: GASettings;

	const editableFields = [
		// { name: 'targetEpochs', label: 'Target Epochs', min: 1, max: 1000, step: 1 },
		{ name: 'targetIndividuals', label: 'Target Individuals', min: 1, max: 10000, step: 1 },
		{ name: 'crossoverRate', label: 'Crossover Rate', min: 0, max: 1, step: 0.01 },
		{ name: 'crossoverUniformRate', label: 'Uniform Crossover Rate', min: 0, max: 1, step: 0.01 },
		{ name: 'mutationRate', label: 'Mutation Rate', min: 0, max: 1, step: 0.01 }
	] satisfies {
		name: keyof Omit<SettingsOnce | SettingsTryAll, 'crossoverMethod' | 'mutationMethod'>;
		label: string;
		min: number;
		max: number;
		step: number;
	}[];

	// export let run: () => void = () => {};
	// export let runAll: () => void = () => {};
	export let progress: number = 0;
	export let progressMax: number = 0;

	function handleCrossoverChange(event: Event) {
		settings.once.crossoverMethod = Number.parseInt((event.target as HTMLSelectElement).value);
	}
	function handleMutationChange(event: Event) {
		settings.once.mutationMethod = Number.parseInt((event.target as HTMLSelectElement).value);
	}
	function handleTryAllCrossoverChange(event: Event) {
		settings.tryAll.crossoverMethod = Array.from(
			(event.target as HTMLSelectElement).selectedOptions
		).map((option) => Number.parseInt(option.value));
	}
	function handleTryAllMutationChange(event: Event) {
		settings.tryAll.mutationMethod = Array.from(
			(event.target as HTMLSelectElement).selectedOptions
		).map((option) => Number.parseInt(option.value));
	}
</script>

<section>
	<div class="flex flex-col gap-4 bg-gray-200 p-4">
		<h1 class="text-2xl font-bold mb-2">GA Settings</h1>

		<div class="flex flex-col gap-2">
			<label class="flex items-center">
				GA Seed:
				<input type="text" class="px-2 ml-2" bind:value={settings.gaSeed} />
			</label>

			<label class="flex items-center">
				Vehicle Fit Score Multiplier:
				<input type="number" class="px-2 ml-2" bind:value={settings.fitScoreMultiplier} />
			</label>

			<label class="flex items-center">
				Delayed Penalty:
				<input type="number" class="px-2 ml-2" bind:value={settings.delayedPenalty} />
			</label>

			<label class="flex items-center">
				Must Deliver Undelivered Penalty:
				<input type="number" class="px-2 ml-2" bind:value={settings.mustDeliverPenalty} />
			</label>
		</div>

		{#if settings.mode === GAMode.Once}
			<div class="flex flex-col gap-2">
				<label class="flex items-center">
					Target Epochs:
					<input
						type="number"
						min={1}
						max={1000}
						class="px-2 ml-2"
						bind:value={settings.once['targetEpochs']}
					/>
				</label>

				{#each editableFields as { name, label, min, max, step }}
					<label class="flex items-center">
						{label}:
						<input
							type="number"
							{min}
							{max}
							{step}
							class="px-2 ml-2"
							bind:value={settings.once[name]}
						/>
					</label>
				{/each}

				<label class="flex items-center">
					Crossover Type:
					<select
						class="px-2 ml-2"
						value={String(settings.once.crossoverMethod)}
						on:change={handleCrossoverChange}
					>
						{#each Object.entries(CrossoverTypeLabels) as [type, label]}
							<option value={type}>{label}</option>
						{/each}
					</select>
				</label>

				<label class="flex items-center">
					Mutation Type:
					<select
						class="px-2 ml-2"
						value={String(settings.once.mutationMethod)}
						on:change={handleMutationChange}
					>
						{#each Object.entries(MutationTypeLabels) as [type, label]}
							<option value={type}>{label}</option>
						{/each}
					</select>
				</label>
			</div>
		{:else}
			<div class="flex flex-col gap-2">
				<label class="flex items-center">
					Target Epochs:
					<input
						type="number"
						min={1}
						max={1000}
						class="px-2 ml-2"
						bind:value={settings.tryAll['targetEpochs']}
					/>
				</label>

				{#each editableFields as { name, label, min, max, step }}
					<div class="flex items-center gap-2">
						{label}:
						<input
							type="number"
							{min}
							{max}
							{step}
							class="px-2 ml-2"
							bind:value={settings.tryAll[name].min}
						/>
						<input
							type="number"
							{min}
							{max}
							{step}
							class="px-2"
							bind:value={settings.tryAll[name].max}
						/>
						<input
							type="number"
							{min}
							{max}
							{step}
							class="px-2"
							bind:value={settings.tryAll[name].step}
						/>
					</div>
				{/each}

				<label class="flex items-center">
					Crossover Type:
					<select
						class="px-2 ml-2"
						value={String(settings.tryAll.crossoverMethod)}
						on:change={handleTryAllCrossoverChange}
						multiple
					>
						{#each Object.entries(CrossoverTypeLabels) as [type, label]}
							<option value={type}>{label}</option>
						{/each}
					</select>
				</label>

				<label class="flex items-center">
					Mutation Type:
					<select
						class="px-2 ml-2"
						value={String(settings.tryAll.mutationMethod)}
						on:change={handleTryAllMutationChange}
						multiple
					>
						{#each Object.entries(MutationTypeLabels) as [type, label]}
							<option value={type}>{label}</option>
						{/each}
					</select>
				</label>
			</div>
		{/if}

		<div class="flex items-center justify-between">
			<div class="ml-auto">
				{#if progress !== 0 && progress !== progressMax}
					<div class="flex items-center">
						<div class="w-20">Progress:</div>
						<div>{progress}/{progressMax} ({Math.floor((progress / progressMax) * 100)}%)</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
