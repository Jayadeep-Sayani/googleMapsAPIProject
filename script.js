var markers = [];
var map;
var service;
var currentLocation;
var infoWindow;
var directionsRenderer;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13
  });
  infoWindow = new google.maps.InfoWindow({
    content: '<h3>You are here</h3>'
  });
  service = new google.maps.places.PlacesService(map);
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map
  });
  var radiusSlider = document.getElementById("radius-slider");
  radiusSlider.addEventListener('change', function() {
    deleteMarkers();
    if (currentLocation) {
      showPlacesNearLocation(currentLocation, document.getElementById("placeType").value, this.value);
    } 
  });

  const select = document.getElementById('placeType');
  select.value = "restaurant";
  select.addEventListener('change', function() {
    deleteMarkers();

    const placeType = select.value;
    if (currentLocation) {
      showPlacesNearLocation(currentLocation, placeType, radiusSlider.value);
    } 
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        infoWindow.close();
        map.setCenter(pos);
        currentLocation = pos;
        showPlacesNearLocation(pos, 'restaurant', radiusSlider.value);
      },
      () => {
        alert("Error: The Geolocation service failed.");
      }
    );
  } else {
    alert("Error: Your browser doesn't support geolocation.");
  }
}

function showPlacesNearLocation(pos, placeType, radius) {
  currentLocation = pos;
  service.nearbySearch({
    location: pos,
    radius: radius,
    type: [placeType]
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Sort the results by rating
      results.sort((a, b) => b.rating - a.rating);
      console.log(results)
      for (let i = 0; i < 3; i++) {

        createMarker(results[i], 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
      }
      for (let i = 3; i < results.length; i++) {
        createMarker(results[i], 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
      }
    }
  });
}

function createMarker(place, iconUrl) {
  var marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    icon: {
      url: iconUrl
    },
    title: place.name
  });
  var contentString = '<h3>' + place.name + '</h3>' +
      '<p>Rating: ' + place.rating + ' out of 5</p>' +
      '<p>' + place.vicinity + '</p><button class="directionbutton" onclick=showDirections(' + place.geometry.location.lat() + ',' + place.geometry.location.lng() + ')>Show Directions</button>';

  marker.addListener('click', function() {
    infoWindow.setContent(contentString);
    infoWindow.open(map, marker);
  });

  markers.push(marker);
}



function showDirections(lat, lng) {
  directionsRenderer.setMap(null);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {

      var userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      var restaurantLocation = new google.maps.LatLng(lat, lng);

      var directionsService = new google.maps.DirectionsService();

      directionsRenderer.setMap(null);
      // Request directions from user's location to restaurant
      directionsService.route({
        origin: userLocation,
        destination: restaurantLocation,
        travelMode: document.getElementById("typetrav").value
      }, function(response, status) {
        if (status === 'OK') {


          directionsRenderer.setDirections(response);
          directionsRenderer.setMap(map);
        } else {
          alert('Directions request failed due to ' + status);
        }
      });
    }, function() {
      alert('Error: The Geolocation service failed.');
    });
  } else {
    alert("Error: Your browser doesn't support geolocation.");
  }
}

function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  hideMarkers();
  markers = [];
}