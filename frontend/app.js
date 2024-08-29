let map;
const markers = {};
const fetchInterval = 5 * 1000; // 5 seconds
const showCarsButton = document.getElementById('showCarsBtn');

// Initialize Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 2,
  });

  // Start polling after map initialization
  startPolling();
}

// Clear existing markers
function clearMarkers() {
  Object.values(markers).forEach((marker) => marker.setMap(null));
}

// Add new markers to the map
function addMarkers(vehicles) {
  vehicles.forEach((vehicle) => {
    const { id, location } = vehicle;
    const [lat, lng] = location.split(',').map(Number);

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: `Vehicle ID: ${id}`,
    });

    markers[id] = marker;
  });
}

// Update the map with vehicle data
function updateMap(vehicles) {
  clearMarkers();
  addMarkers(vehicles);
}

// Fetch vehicle data periodically
async function fetchVehicles() {
  try {
    // const response = await fetch('http://localhost:5000/vehicles');
    // const vehicles = await response.json();
    const vehicles = simulateMovement({ id: 1, location: '37.7749,-122.4194' });
    updateMap(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error.message);
  }
}

// Simulate vehicle movement
function simulateMovement(vehicle) {
  let [lat, lng] = vehicle.location.split(',').map(Number);

  // Simulate slight movement in lat/lng
  lat += (Math.random() - 0.5) * 0.001;
  lng += (Math.random() - 0.5) * 0.001;

  // Update vehicle's location
  vehicle.location = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  return [vehicle];
}

// Adjust map bounds to include all markers
function adjustBounds() {
  const vehicles = simulateMovement({ id: 1, location: '37.7749,-122.4194' });
  const bounds = new google.maps.LatLngBounds();
  console.log('Adjusting bounds');

  vehicles.forEach((vehicle) => {
    const [lat, lng] = vehicle.location.split(',').map(Number);

    // Optionally add padding to bounds
    const padding = 0.01;
    bounds.extend(new google.maps.LatLng(lat + padding, lng + padding));
    bounds.extend(new google.maps.LatLng(lat - padding, lng - padding));
  });

  map.fitBounds(bounds);
}

// Start polling for vehicle data
function startPolling() {
  setInterval(fetchVehicles, fetchInterval);
  fetchVehicles();
  adjustBounds();
}

showCarsButton.addEventListener('click', () => {
  adjustBounds();
});

// Initialize the map when the page loads
window.onload = initMap;
