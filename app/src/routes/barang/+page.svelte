<script lang="ts">
    import type { PageData } from '../$types';
    export let data: PageData;

    $: ({ locations, items, trucks } = data);
    console.log(data)
</script>

<div>
    <div>
        <div class="text-3xl font-bold">Locations</div>
        
        <form action="?/createLocation" method="POST" class="container bg-blue-100">
            <div class="text-xl font-bold">Add Location</div>

            <label for="name">Name</label>
            <input type="text" name="name" class="border border-black rounded" />

            <label for="latitude">Latitude</label>
            <input type="number" name="latitude" class="border border-black rounded" />

            <label for="longitude">Longitude</label>
            <input type="number" name="longitude" class="border border-black rounded" />
            
            <button type="submit" class="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700">Submit</button>
        </form>
        
        {#each locations as location}
        <div>
            <form action="?/updateLocation" method="POST" class="container bg-gray-100">
                <input value={location.id} name="id" hidden/>
                
                <label for="name">Name</label>
                <input value={location.name} type="text" name="name" class="border border-black rounded" />
                
                <label for="latitude">Latitude</label>
                <input value={location.lat} type="number" name="latitude" class="border border-black rounded" />
                
                <label for="longitude">Longitude</label>
                <input value={location.lng} type="number" name="longitude" class="border border-black rounded" />
                
                <button type="submit" class="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700">Update</button>
                
                <form action="?/deleteLocation&id={location.id}" method="POST">
                    <button type="submit" class="bg-red-500 text-white rounded py-2 px-4 hover:bg-red-700">Delete</button>
                </form>
            </form>
        </div>
        {/each}
    </div>

    <div>
        <div class="text-3xl font-bold">Barang</div>
        <form action="?/createBarang" method="POST" class="container bg-blue-100">
            <div class="text-xl font-bold">Add Barang</div>

            <label for="Width">width</label>
            <input type="number" name="Width" class="border border-black rounded" />

            <label for="Height">height</label>
            <input type="number" name="Height" class="border border-black rounded" />
            
            <label for="Depth">depth</label>
            <input type="number" name="Depth" class="border border-black rounded" />

            <label for="OriginCity">origin_city</label>
            <select name="OriginCity">
                {#each locations as location}
                    <option value={location.id}>{location.name}</option>
                {/each}
            </select>

            <label for="DestCity">dest_city</label>
            <select name="DestCity">
                {#each locations as location}
                    <option value={location.id}>{location.name}</option>
                {/each}
            </select>

            <label for="MustDeliver">must_deliver</label>
            <input type="checkbox" name="MustDeliver" class="border border-black rounded" />
            
            <button type="submit" class="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700">Submit</button>
        </form>
        
        {#each items as item}
        <div>
            <form action="?/updateBarang" method="POST" class="container bg-gray-100">
                <input value={item.id} name="id" hidden/>

                <label for="Width">width</label>
                <input value="{item.width}" type="number" name="Width" class="border border-black rounded" />
    
                <label for="Height">height</label>
                <input value="{item.height}" type="number" name="Height" class="border border-black rounded" />
                
                <label for="Depth">depth</label>
                <input value="{item.depth}" type="number" name="Depth" class="border border-black rounded" />
    
                <label for="OriginCity">origin_city</label>
                <select value="{item.origin_city}" name="OriginCity">
                    {#each locations as location}
                        <option value={location.id}>{location.name}</option>
                    {/each}
                </select>
    
                <label for="DestCity">dest_city</label>
                <select value="{item.dest_city}" name="DestCity">
                    {#each locations as location}
                        <option value={location.id}>{location.name}</option>
                    {/each}
                </select>
    
                <label for="MustDeliver">must_deliver</label>

                <input type="checkbox" name="MustDeliver" class="border border-black rounded" checked={item.must_deliver == 1}/>
                
                <button type="submit" class="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700">Update</button>
                <form action="?/deleteBarang&id={item.id}" method="POST">
                    <button type="submit" class="bg-red-500 text-white rounded py-2 px-4 hover:bg-red-700">Delete</button>
                </form>
            </form>
        </div>
        {/each}
    </div>

    <div>
        <div class="text-3xl font-bold">Truck</div>
        <form action="?/createTruck" method="POST" class="container bg-blue-100">
            <div class="text-xl font-bold">Add Truck</div>

            <label for="Width">width</label>
            <input type="number" name="Width" class="border border-black rounded" />
            
            <label for="Height">height</label>
            <input type="number" name="Height" class="border border-black rounded" />
            
            <label for="Depth">depth</label>
            <input type="number" name="Depth" class="border border-black rounded" />
            
            <label for="Weight">Weight</label>
            <input type="number" name="Weight" class="border border-black rounded" />

            <label for="pf">packing_factor</label>
            <input type="number" name="pf" class="border border-black rounded" />

            <label for="ppk">price_per_km</label>
            <input type="number" name="ppk" class="border border-black rounded" />

            <label for="cpk">fuel_consumpt_per_km</label>
            <input type="number" name="cpk" class="border border-black rounded" />

            <label for="ppl">fuel_price_per_liter</label>
            <input type="number" name="ppl" class="border border-black rounded" />
            
            <button type="submit" class="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700">Submit</button>
        </form>

        {#each trucks as truck}
        <div>
            <form action="?/updateTruck" method="POST" class="container bg-gray-100">
                <input value={truck.id} name="id" hidden/>

                <label for="Width">width</label>
                <input value="{truck.cap_width}" type="number" name="Width" class="border border-black rounded" />
                
                <label for="Height">height</label>
                <input value="{truck.cap_height}" type="number" name="Height" class="border border-black rounded" />
                
                <label for="Depth">depth</label>
                <input value="{truck.cap_depth}" type="number" name="Depth" class="border border-black rounded" />
                
                <label for="Weight">Weight</label>
                <input value="{truck.cap_weight}" type="number" name="Weight" class="border border-black rounded" />
    
                <label for="pf">packing_factor</label>
                <input value="{truck.packing_factor}" type="number" name="pf" class="border border-black rounded" />
    
                <label for="ppk">price_per_km</label>
                <input value="{truck.price_per_km}" type="number" name="ppk" class="border border-black rounded" />
    
                <label for="cpk">fuel_consumpt_per_km</label>
                <input value="{truck.fuel_consumpt_per_km}" type="number" name="cpk" class="border border-black rounded" />
    
                <label for="ppl">fuel_price_per_liter</label>
                <input value="{truck.fuel_price_per_liter}" type="number" name="ppl" class="border border-black rounded" />
    
                <button type="submit" class="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700">Update</button>
                <form action="?/deleteTruck&id={truck.id}" method="POST">
                    <button type="submit" class="bg-red-500 text-white rounded py-2 px-4 hover:bg-red-700">Delete</button>
                </form>
            </form>
        </div>
        {/each}
    </div>
</div>