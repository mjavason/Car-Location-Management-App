let map;
const markers = {};
const fetchInterval = 5 * 1000; // 5 seconds
const showCarsButton = document.getElementById('showCarsBtn');
const carIconUrl = 'car.png';

if (!localStorage.getItem('userId')) localStorage.setItem('userId', Date.now());
const userId = localStorage.getItem('userId');

const apiURL = 'https://q2qm7dd4-5000.uks1.devtunnels.ms';

// Initialize Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 2,
  });

  // Start polling after map initialization
  startPolling();
}

// Add or update car markers on the map
function addOrUpdateMarkers(vehicles) {
  vehicles.forEach((vehicle) => {
    const { id, longitude, latitude } = vehicle;

    // Check if the marker already exists
    if (markers[id]) {
      // Update the marker's position to simulate movement
      markers[id].setPosition({ lat: latitude, lng: longitude });
    } else {
      // Create a new marker with the car icon
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        icon: {
          url: carIconUrl,
          scaledSize: new google.maps.Size(50, 50), // Scale the icon size
        },
        title: `Vehicle ID: ${id}`,
      });

      markers[id] = marker;
    }
  });
}

// Fetch vehicle data periodically
async function fetchVehicles() {
  try {
    await updateMyLocation();
    const response = await fetch(`${apiURL}/vehicles`);
    const vehicles = JSON.parse(await response.json());
    // const vehicles = simulateMovement({ id: 1, location: '37.7749,-122.4194' });
    addOrUpdateMarkers(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error.message);
  }
}

// Simulate vehicle movement
// function simulateMovement(vehicle) {
//   let [lat, lng] = vehicle.location.split(',').map(Number);

//   // Simulate slight movement in lat/lng
//   lat += (Math.random() - 0.5) * 0.001;
//   lng += (Math.random() - 0.5) * 0.001;

//   // Update vehicle's location
//   vehicle.location = `${lat.toFixed(6)},${lng.toFixed(6)}`;
//   return [vehicle];
// }

// Adjust map bounds to include all markers
async function adjustBounds() {
  // const vehicles = simulateMovement({ id: 1, location: '37.7749,-122.4194' });
  const response = await fetch(`${apiURL}/vehicles`);
  const vehicles = JSON.parse(await response.json());

  const bounds = new google.maps.LatLngBounds();
  console.log('Adjusting bounds');

  vehicles.forEach((vehicle) => {
    const { longitude, latitude } = vehicle;

    // Optionally add padding to bounds
    const padding = 0.01;
    bounds.extend(
      new google.maps.LatLng(latitude + padding, longitude + padding)
    );
    bounds.extend(
      new google.maps.LatLng(latitude - padding, longitude - padding)
    );
  });

  map.fitBounds(bounds);
}

// Start polling for vehicle data
async function startPolling() {
  setInterval(fetchVehicles, fetchInterval);
  fetchVehicles();
  adjustBounds();
}

function updateMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        // Send the coordinates to the server
        fetch(`${apiURL}/vehicles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userId,
            licensePlate: 'unknown',
            latitude,
            longitude,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
          })
          .catch((error) => console.error(error));
      },
      (error) => {
        console.error(`Error getting location: ${error.message}`);
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
}

showCarsButton.addEventListener('click', () => {
  adjustBounds();
});

// Initialize the map when the page loads
window.onload = initMap;
