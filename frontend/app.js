let map;
const markers = {};

// Initialize Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 2
  });
}

// Update map with vehicle data
function updateMap(vehicles) {
  // Clear existing markers
  for (const marker of Object.values(markers)) {
    marker.setMap(null);
  }

  // Add new markers
  vehicles.forEach(vehicle => {
    const { id, location } = vehicle;
    const [lat, lng] = location.split(',').map(Number);

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: `Vehicle ID: ${id}`
    });

    markers[id] = marker;
  });

  // Adjust map bounds to include all markers
  const bounds = new google.maps.LatLngBounds();
  vehicles.forEach(vehicle => {
    const [lat, lng] = vehicle.location.split(',').map(Number);
    bounds.extend(new google.maps.LatLng(lat, lng));
  });
  map.fitBounds(bounds);
}

// Periodically fetch vehicle data
async function fetchVehicles() {
  try {
    const response = await fetch('http://localhost:5000/vehicles');
    const vehicles = await response.json();
    updateMap(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error.message);
  }
}

// Polling interval
const fetchInterval = 10000; // 30 seconds

// Start polling
setInterval(fetchVehicles, fetchInterval);

// Initialize map when page loads
window.onload = initMap;
