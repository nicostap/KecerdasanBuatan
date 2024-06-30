<!-- <script>
    export let items = [];
  
    let filter = 'all';
    let sortKey = 'id';
  
    const filteredItems = () => {
      return items
        .filter(item => filter === 'all' || (filter === 'notDelivered' && item.truckId === -1))
        .sort((a, b) => a[sortKey] - b[sortKey]);
    };
  </script>
  
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
   -->