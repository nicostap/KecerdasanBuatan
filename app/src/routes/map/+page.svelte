<!-- MapComponent.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { saveLocations, loadLocations } from '$lib/map/locationService'; // Adjust the import path as needed
  import type { PageData } from '../$types';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
  import 'leaflet-control-geocoder';

  export let data: PageData

  $: ({ locations } = data)
  console.log(data)
  // Other existing code...  
  let showModal = false;
  let locationName = "";
  let marker: L.Marker | null = null;
  let geocodeMarker: L.Marker | null = null;
  let map: L.Map;
  let adjacencyMatrix: number[][] = [];

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

    const savedLocationsLayer = L.layerGroup().addTo(map);

    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true
    }).addTo(map);

    const baseMaps = {
      "OpenStreetMap": osm,
      "OpenStreetMap.HOT": osmHOT
    };

    const overlayMaps = {
      "Saved Locations": savedLocationsLayer
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
      .setContent(latlng.toString())
      .openOn(map);

    if (marker) {
      marker.setLatLng(latlng);
    } else {
      marker = L.marker(latlng).addTo(map);
    }
  }

  function updateDistancesAndMatrix() {
    const numLocations = locations.length;
    const distances = initializeAdjacencyMatrix(numLocations);

    for (let i = 0; i < numLocations; i++) {
      for (let j = i + 1; j < numLocations; j++) {
        const distance = locations[i].latlng.distanceTo(locations[j].latlng) / 1000;
        distances[i][j] = distance;
        distances[j][i] = distance;
      }
    }

    console.log("Distances Matrix:");
    console.table(distances);

    adjacencyMatrix = distances;
    drawPaths(findAllPaths(adjacencyMatrix));
  }

  function initializeAdjacencyMatrix(numLocations: number): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < numLocations; i++) {
      matrix[i] = [];
      for (let j = 0; j < numLocations; j++) {
        matrix[i][j] = i === j ? 0 : Infinity;
      }
    }
    return matrix;
  }

  function findAllPaths(matrix: number[][]): number[][] {
    const numLocations = matrix.length;
    const paths: number[][] = [];

    function dfs(start: number, path: number[]) {
      for (let next = 0; next < numLocations; next++) {
        if (matrix[start][next] !== Infinity && !path.includes(next)) {
          const newPath = [...path, next];
          paths.push(newPath);
          dfs(next, newPath);
        }
      }
    }

    for (let i = 0; i < numLocations; i++) {
      dfs(i, [i]);
    }

    return paths;
  }

  function drawPaths(paths: number[][]) {
    paths.forEach(path => {
      const latlngs = path.map(index => L.latLng(locations[index].lat, locations[index].lng));
      L.polyline(latlngs, { color: 'blue' }).addTo(map);
    });
  }
</script>

<style>
  /* Ensure modal overlays are on top of map */
  #coordinate {
    z-index: 1001; /* Ensure modal is above leaflet map */
  }
</style>

<div class="container mx-auto p-5">
  <div class="flex flex-wrap p-5 bg-[bisque]">
    <div class="w-full lg:w-3/4 p-0 pr-4 mb-3">
      <div id="map" class="h-[75vh] relative">
        <div id="coordinate" class="absolute text-white bg-black p-2">Latitude:<br>Longitude:</div>
      </div>
    </div>
    <div class="w-full lg:w-1/4 bg-white p-3 h-[75vh] overflow-y-auto">
      <button class="btn btn-primary mb-3 w-full" on:click={() => showModal = true}>Save Location</button>
      <div class="card">
        <form action="?/createLocation" method="POST">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required />
          
          <label for="lat">Latitude</label>
          <input type="number" id="latitude" name="latitude" step="any" required readonly/>
          
          <label for="lng">Longitude</label>
          <input type="number" id="longitude" name="longitude" step="any" required readonly />
          
          <button type="submit" class="bg-blue-200">Submit</button>
        </form>
        <div class="card-header">Saved Locations</div>
        <ul id="savedLocationsList" class="list-group list-group-flush">
          {#each locations as location}
            <li class="list-group-item"><strong>{location.name}</strong><br>Latitude: {location.lat.toFixed(3)}, Longitude: {location.lng.toFixed(3)}</li>
            <li class="list-group-item">
              <form action="?/deleteLocation&id={location.id}" method="POST">
                <button type="submit">DELETE</button>
              </form>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>