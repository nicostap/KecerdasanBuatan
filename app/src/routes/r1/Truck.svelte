<script lang="ts">
	import type { AbstractDeliveryVehicle } from '$lib/r1/vehicles/AbstractDeliveryVehicle';
	import type { MobilBox } from '$lib/r1/vehicles/MobilBox';
	import { createEventDispatcher } from 'svelte';

	export let idx: number = 0;
	export let vehicle: MobilBox;

	interface $$Events {
		delete: CustomEvent<void>;
		duplicate: CustomEvent<MobilBox>;
	}

	type Dispatcher<TEvents extends Record<keyof TEvents, CustomEvent<any>>> = {
		[Property in keyof TEvents]: TEvents[Property]['detail'];
	};

	const dispatch = createEventDispatcher<Dispatcher<$$Events>>();

	const editableNumbers: [keyof MobilBox, string, string][] = [
		['capacityWidth', 'width', 'width capacity'],
		['capacityHeight', 'height', 'height capacity'],
		['capacityDepth', 'depth', 'depth capacity'],
		['capacityWeight', 'weight', 'weight capacity'],
		['packingFactor', 'pf', 'packing factor'],
		['pricePerKm', 'ppk', 'price per km'],
		['fuelPricePerLiter', 'fp/l', 'fuel price per liter'],
		['fuelConsumptionPerKm', 'fc/km', 'fuel consumption per km']
	];

	let editing = false;

	function editVehicle() {
		editing = !editing;
	}
</script>

<div class="bg-gray-100 min-h-36 py-6 px-4 w-80 flex flex-col rounded-lg shadow-lg border border-gray-300">
	<div class="bg-gray-200 rounded-t-lg py-2 px-4 mb-4">
	  <div class="font-bold text-xl text-gray-700">
		Vehicle #{idx}
	  </div>
	</div>
	<button 
	type="button" 
	class="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 transition duration-300 rounded-md shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
	on:click={() => dispatch('duplicate', vehicle)}
  > Duplicate </button>
	<!-- Vehicle details -->
	{#each editableNumbers as [key, label, title]}
	  <label {title} class="flex items-center py-2">
		<span class="text-gray-600 w-28">{label}:</span>
		<input
		  type="number"
		  bind:value={vehicle[key]}
		  class="w-24 ml-auto px-3 py-1 rounded-md bg-white border border-gray-300 focus:outline-none focus:border-blue-400"
		  step={0.01}
		  min={0}
		  max={1000000}
		  readonly={!editing} 
		/>
	  </label>
	{/each}
	
	<!-- Buttons for actions -->
	<div class="flex justify-end pt-4 mt-auto space-x-4">
	  {#if !editing}
		<button 
		  type="button" 
		  class="px-4 py-2 bg-blue-400 hover:bg-blue-500 transition duration-300 rounded-md shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
		  on:click={editVehicle}
		>
		  Edit
		</button>
	  {:else}
		<button 
		  type="button" 
		  class="px-4 py-2 bg-green-400 hover:bg-green-500 transition duration-300 rounded-md shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
		  on:click={() => {
			// Save edited vehicle logic
			editing = false;
		  }}
		>
		  Save
		</button>
	  {/if}
		<button 
		  type="button" 
		  class="px-4 py-2 bg-red-400 hover:bg-red-500 transition duration-300 rounded-md shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
		  on:click={() => dispatch('delete')}
		> Delete </button>

	</div>
  </div>