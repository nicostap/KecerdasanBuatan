<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from '../$types';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
  import 'leaflet-control-geocoder';

  export let data: PageData;

  $: ({ locations } = data);
  
  let marker: L.Marker | null = null;
  let geocodeMarker: L.Marker | null = null;
  let map: L.Map;
  let locationArr: L.Marker[] | null = null;
  
  onMount(() => {
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
    });

    map = L.map('map', {
      center: [-7.339494, 112.737976],
      zoom: 13,
      layers: [osm]
    });

    map.zoomControl.setPosition('bottomright');

    createAdjacencyMatrix();

    locationArr = [];
    locations.forEach((loc: { lat: number; lng: number; name: ((layer: L.Layer) => L.Content) | L.Content | L.Popup; }) => {
      locationArr.push(L.marker([loc.lat, loc.lng]).bindPopup(loc.name))
    });

    const markersLayer = L.layerGroup(locationArr).addTo(map);
    const polylineLayer = L.layerGroup(drawPaths()).addTo(map);

    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true
    }).addTo(map);

    const baseMaps = {
      "OpenStreetMap": osm,
      "OpenStreetMap.HOT": osmHOT
    };

    const overlayMaps = {
      "Locations": markersLayer,
      "Graph": polylineLayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const coordinateElement = document.getElementById('coordinate');
      if (coordinateElement) {
        coordinateElement.innerHTML = 'Latitude: ' + e.latlng.lat.toFixed(3) + '<br>Longitude: ' + e.latlng.lng.toFixed(3);
      }
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (geocodeMarker) {
        map.removeLayer(geocodeMarker);
        geocodeMarker = null;
      }
      addMarkerAndPopup(e.latlng);
      
      document.getElementById('latitude')?.setAttribute('value', e.latlng.lat.toString());
      document.getElementById('longitude')?.setAttribute('value', e.latlng.lng.toString());
    });

    geocoder.on('markgeocode', (e: L.Control.Geocoder.MarkGeocodeEvent) => {
      document.getElementById('name')?.setAttribute('value', e.geocode.name);
      document.getElementById('latitude')?.setAttribute('value', e.geocode.center.lat.toString());
      document.getElementById('longitude')?.setAttribute('value', e.geocode.center.lng.toString());

      if (geocodeMarker) {
        map.removeLayer(geocodeMarker);
      }

      geocodeMarker = L.marker(e.geocode.center).addTo(map)
        .bindPopup(e.geocode.name)
        .openPopup();
    });
  });

  function addMarkerAndPopup(latlng: L.LatLng) {
    L.popup({ offset: L.point(0, -30) })
      .setLatLng(latlng)
      .setContent("(" + latlng.lat.toFixed(6) + ", " + latlng.lng.toFixed(6) + ")")
      .openOn(map);

    if (marker) {
      marker.setLatLng(latlng);
    } else {
      marker = L.marker(latlng).addTo(map);
    }
  }

  export function createAdjacencyMatrix(): number[][] {
    const size: number = locations.length;
    const matrix: number[][] = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        matrix[i][j] = i === j ? 0 : Infinity;
      }
    }

    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        const distance = Haversine(locations[i].lat, locations[j].lat, locations[i].lng, locations[j].lng);
        matrix[i][j] = distance;
        matrix[j][i] = distance;
      }
    }
  
    console.log("Distances Matrix:");
    console.table(matrix);
  
    return matrix;
  }

  function Haversine(lat1: number, lat2: number, lon1: number, lon2: number){
    // To radian
    lon1 =  lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    
    // Haversine formula 
    let dlon = lon2 - lon1; 
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
             + Math.cos(lat1) * Math.cos(lat2)
             * Math.pow(Math.sin(dlon / 2),2);
           
    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers
    let r = 6371;

    // Calculate the result
    return(c * r);
  }


  function drawPaths() {
    let arr: L.Polyline[] = [];
    locations.forEach(start => {
      locations.forEach(dest => {
        arr.push(L.polyline([[start.lat, start.lng], [dest.lat, dest.lng]], {color: 'blue'}));
      });
    });
    return arr;
  }
</script>

<style>
  #coordinate {
    z-index: 1001;
  }
</style>

<div class="container mx-auto p-5">
  <div class="flex flex-wrap p-5 bg-[bisque] shadow-xl">

    <!-- Map -->
    <div class="w-full lg:w-3/4 p-0 pr-4 mb-3">
      <div id="map" class="h-[75vh] relative border-2 border-black">
        <div id="coordinate" class="absolute text-white bg-black p-2">Latitude:<br>Longitude:</div>
      </div>
    </div>

    <!-- List? -->
    <div class="w-full lg:w-1/4 bg-[bisque] p-3 h-[75vh] overflow-y-auto">

      <!-- Add New Location -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden mb-4">
        <h2 class="bg-blue-500 text-white text-center py-3 px-4 text-xl font-bold">Add Location</h2>
        <form action="?/createLocation" method="POST" class="bg-white shadow-md rounded p-6">
          <div class="mb-4">
            <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input type="text" id="name" name="name" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          
          <div class="mb-4">
            <label for="latitude" class="block text-gray-700 text-sm font-bold mb-2">Latitude</label>
            <input type="number" id="latitude" name="latitude" step="any" required readonly class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          
          <div class="mb-4">
            <label for="longitude" class="block text-gray-700 text-sm font-bold mb-2">Longitude</label>
            <input type="number" id="longitude" name="longitude" step="any" required readonly class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          
          <div class="flex items-center justify-between">
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit</button>
          </div>
        </form>
      </div>

      <!-- Saved Locations -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="bg-blue-500 text-white text-center py-3 px-4 text-xl font-bold">Saved Locations</div>
        <div class="p-6 space-y-4">
          {#each locations as location}
            <div class="bg-white shadow-md rounded-lg p-4">
              <div class="mb-2">
                <strong class="text-lg text-gray-800">{location.name}</strong>
                <p class="text-sm text-gray-600">Latitude: {location.lat.toFixed(6)} <br> Longitude: {location.lng.toFixed(6)}</p>
              </div>
              <form action="?/deleteLocation&id={location.id}" method="POST" class="text-right">
                <button type="submit" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline">DELETE</button>
              </form>
            </div>
          {:else}
            <div>There are no location saved</div>
          {/each}
        </div>
      </div>

    </div>
  </div>
</div>