<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from '../$types';
  
    export let data: PageData;
  
    let items = [
      { id: 1, truckId: -1 },
      { id: 2, truckId: 1 },
      // Add more items as necessary
    ];
  
    $: ({ items } = data);
    console.log(data);
  
    let filter = 'all';
    let sortKey = 'id';
    let selectedItem = null;
    let newTruckId = null;
  
    const filteredItems = () => {
      return items
        .filter(item => filter === 'all' || (filter === 'notDelivered' && item.truckId === -1))
        .sort((a, b) => a[sortKey] - b[sortKey]);
    };
  
    const addItem = () => {
      if (selectedItem !== null && newTruckId !== null) {
        items[selectedItem].truckId = newTruckId;
      }
    };
  
    const removeItem = () => {
      if (selectedItem !== null) {
        items[selectedItem].truckId = -1;
      }
    };
  
    const handleConfirm = () => {
      // Handle the confirmed items (e.g., send to server, update state, etc.)
      console.log('Confirmed Items:', items);
    };
  </script>
  
  <main>
    <h1>Genetic Algorithm Package Delivery</h1>
    
    <!-- View Items Section -->
    <div>
      <label>
        Filter:
        <select bind:value={filter}>
          <option value="all">All</option>
          <option value="notDelivered">Not Delivered</option>
        </select>
      </label>
  
      <label>
        Sort By:
        <select bind:value={sortKey}>
          <option value="id">Item ID</option>
          <option value="truckId">Truck ID</option>
        </select>
      </label>
    </div>
  
    <ul>
      {#each filteredItems() as item (item.id)}
        <li>
          Item ID: {item.id} - Truck ID: {item.truckId === -1 ? 'Not Delivered' : item.truckId}
        </li>
      {/each}
    </ul>
  
    <!-- Edit Delivery Section -->
    <div>
      <label>
        Select Item:
        <select bind:value={selectedItem}>
          <option value={null}>Select Item</option>
          {#each items as item, index}
            <option value={index}>{item.id}</option>
          {/each}
        </select>
      </label>
  
      <label>
        New Truck ID:
        <input type="number" bind:value={newTruckId} />
      </label>
  
      <button on:click={addItem}>Add to Truck</button>
      <button on:click={removeItem}>Remove from Truck</button>
    </div>
  
    <button on:click={handleConfirm}>CONFIRM</button>
  </main>
  