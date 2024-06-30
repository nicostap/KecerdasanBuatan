<!-- <script>
    export let items = [];
    export let onConfirm;
  
    let selectedItem = null;
    let newTruckId = null;
  
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
  </script>
  
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
  
  <button on:click={() => onConfirm(items)}>CONFIRM</button>
   -->