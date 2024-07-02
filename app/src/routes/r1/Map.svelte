<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from '../$types';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
	import 'leaflet-control-geocoder';
	import { createAdjacencyMatrix } from '$lib/map/AdjacencyMatrix';
	import Geocoder from 'leaflet-control-geocoder';
	import type { MarkGeocodeEvent } from 'leaflet-control-geocoder/dist/control';
	import type { Locations } from '$lib/TypeUtils';

	// export let data: PageData;

	// $: ({ locations } = data);

	export let locations: Locations;

	let marker: L.Marker | null = null;
	let geocodeMarker: L.Marker | null = null;
	let map: L.Map;
	let name: string;
	let lat: string;
	let lng: string;

	onMount(() => {
		const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});

		const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution:
				'© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
		});

		map = L.map('map', {
			center: [-7.339494, 112.737976],
			zoom: 13,
			layers: [osm]
		});

		map.zoomControl.setPosition('bottomright');

		createAdjacencyMatrix(locations);

		const markersLayer = L.layerGroup(drawLoc()).addTo(map);
		const polylineLayer = L.layerGroup(drawPaths()).addTo(map);

		const geocoder = new Geocoder({
			defaultMarkGeocode: true
		}).addTo(map);

		const baseMaps = {
			OpenStreetMap: osm,
			'OpenStreetMap.HOT': osmHOT
		};

		const overlayMaps = {
			Locations: markersLayer,
			Graph: polylineLayer
		};

		L.control.layers(baseMaps, overlayMaps).addTo(map);

		map.on('mousemove', (e: L.LeafletMouseEvent) => {
			const coordinateElement = document.getElementById('coordinate');
			if (coordinateElement) {
				coordinateElement.innerHTML =
					'Latitude: ' + e.latlng.lat.toFixed(3) + '<br>Longitude: ' + e.latlng.lng.toFixed(3);
			}
		});

		map.on('click', (e: L.LeafletMouseEvent) => {
			if (geocodeMarker) {
				map.removeLayer(geocodeMarker);
				geocodeMarker = null;
			}
			addMarkerAndPopup(e.latlng);

			lat = e.latlng.lat.toString();
			lng = e.latlng.lng.toString();
		});

		geocoder.on('markgeocode', (e: MarkGeocodeEvent) => {
			name = e.geocode.name;
			lat = e.geocode.center.lat.toString();
			lng = e.geocode.center.lng.toString();

			if (geocodeMarker) {
				map.removeLayer(geocodeMarker);
			}

			geocodeMarker = L.marker(e.geocode.center).addTo(map).bindPopup(e.geocode.name).openPopup();
		});
	});

	function addMarkerAndPopup(latlng: L.LatLng) {
		L.popup({ offset: L.point(0, -30) })
			.setLatLng(latlng)
			.setContent('(' + latlng.lat.toFixed(6) + ', ' + latlng.lng.toFixed(6) + ')')
			.openOn(map);

		if (marker) {
			marker.setLatLng(latlng);
		} else {
			marker = L.marker(latlng).addTo(map);
		}
	}

	function drawLoc() {
		let arr: L.Marker[] = [];
		locations.forEach(
			(loc: {
				lat: number;
				lng: number;
				name: ((layer: L.Layer) => L.Content) | L.Content | L.Popup;
			}) => {
				arr.push(L.marker([loc.lat, loc.lng]).bindPopup(loc.name));
			}
		);
		return arr;
	}
	function drawPaths() {
		let arr: L.Polyline[] = [];
		locations.forEach((start) => {
			locations.forEach((dest) => {
				arr.push(
					L.polyline(
						[
							[start.lat, start.lng],
							[dest.lat, dest.lng]
						],
						{ color: 'blue' }
					)
				);
			});
		});
		return arr;
	}
</script>

<div class="container mx-auto p-5 bg-[bisque]">
	<h1 class="text-3xl font-bold text-red-900 mb-6">City Map</h1>
	<div class="flex">
		<!-- Map -->
		<div class="w-full lg:w-3/4 p-0 pr-4 mb-3">
			<div id="map" class="h-[75vh] relative border-2 border-black">
				<div id="coordinate" class="absolute text-white bg-black p-2">
					Latitude:<br />Longitude:
				</div>
			</div>
		</div>

		<!-- List? -->
		<div class="w-full lg:w-1/4 bg-[bisque] p-3 h-[75vh] overflow-y-auto">
			<!-- Add New Location -->
			<div class="bg-white shadow-md rounded-lg overflow-hidden mb-4">
				<h2 class="bg-blue-500 text-white text-center py-3 px-4 text-xl font-bold">Location</h2>
				<div class="container bg-blue-100 p-4">
					<div class="font-bold">Nama:</div>
					<div class="mb-2">{locations[0].name}</div>
					<div><strong>Latitude: </strong> {locations[0].lat}</div>
					<div><strong>Longitude: </strong> {locations[0].lng}</div>
				</div>
				<form action="?/createLocation" method="POST" class="bg-white shadow-md rounded p-6">
					<div class="mb-4">
						<label for="name" class="block text-gray-700 text-sm font-bold mb-2">Name</label>
						<input
							bind:value={name}
							type="text"
							id="name"
							name="name"
							required
							class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						/>
					</div>

					<div class="mb-4">
						<label for="latitude" class="block text-gray-700 text-sm font-bold mb-2">Latitude</label
						>
						<input
							bind:value={lat}
							type="number"
							id="latitude"
							name="latitude"
							step="any"
							required
							readonly
							class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						/>
					</div>

					<div class="mb-4">
						<label for="longitude" class="block text-gray-700 text-sm font-bold mb-2"
							>Longitude</label
						>
						<input
							bind:value={lng}
							type="number"
							id="longitude"
							name="longitude"
							step="any"
							required
							readonly
							class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						/>
					</div>

					<div class="flex items-center justify-between">
						<button
							type="submit"
							class="bg-blue-500 hover:bg-blue-700 text-white font-bold m-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
							>Add New</button
						>
						<form action="?/updateLocation" method="POST">
							<input value="1" name="id" hidden />
							<input bind:value={name} type="text" name="name" hidden />
							<input bind:value={lat} type="number" name="latitude" hidden readonly />
							<input bind:value={lng} type="number" name="longitude" hidden readonly />
							<button
								type="submit"
								class="bg-blue-500 hover:bg-blue-700 text-white font-bold m-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
								>Update Origin</button
							>
						</form>
					</div>
				</form>
			</div>

			<!-- Saved Locations -->
			<div class="bg-white shadow-xl rounded-lg overflow-hidden">
				<div class="bg-blue-500 text-white text-center py-3 px-4 text-xl font-bold">
					Saved Locations
				</div>
				<div class="p-6 space-y-4">
					{#each locations as location}
						<form
							action="?/updateLocation"
							method="POST"
							class="bg-white border border-gray shadow-md rounded-lg p-4 mb-2"
						>
							<input value={location.id} name="id" hidden />

							<div>
								<label for="name" class="text-lg font-bold text-gray-800">Name: </label>
								<input value={location.name} type="text" name="name" class="rounded p-1" />
							</div>

							<div>
								<label for="latitude" class="text-sm text-gray-600">Latitude: </label>
								<input
									value={location.lat}
									type="number"
									name="latitude"
									step={0.0000001}
									class="rounded p-1"
								/>
							</div>

							<div>
								<label for="longitude" class="text-sm text-gray-600">Longitude: </label>
								<input
									value={location.lng}
									type="number"
									name="longitude"
									step={0.0000001}
									class="rounded p-1"
								/>
							</div>

							<div class="flex lg:justify-center justify-end pt-2">
								<button
									type="submit"
									class="bg-blue-500 text-white rounded mx-2 py-2 px-4 hover:bg-blue-700"
									>Update</button
								>

								<form action="?/deleteLocation&id={location.id}" method="POST">
									<button
										type="submit"
										class="bg-red-500 text-white rounded mx-2 py-2 px-4 hover:bg-red-700"
										>Delete</button
									>
								</form>
							</div>
						</form>
					{:else}
						<div>There are no location saved</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	#coordinate {
		z-index: 1001;
	}
</style>
