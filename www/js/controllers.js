var app = angular.module('app.controllers', ['ionic', "firebase"])

app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
])

app.controller("loginCtrl",
  function($scope, Auth, $state, $window, $ionicPopup) {

    $scope.createUser = function() {
      $scope.message = null;
      $scope.error = null;

      // Create a new user
      firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
		  var uid = firebaseUser.uid;
		  console.log("User created with uid: " + firebaseUser.uid);
		  firebase.database().ref('Users/').child(firebaseUser.uid).set({FirstName: $scope.fname, LastName: $scope.lname});
		  $window.localStorage.setItem("FirstName", $scope.fname);
		  $state.go('tabs.home');
        }).catch(function(error) {
		  $ionicPopup.alert({
			title: 'Signup Error!',
			template: error.message
    });	
          $scope.error = error;
        });
    };

    $scope.deleteUser = function() {
      $scope.message = null;
      $scope.error = null;

      // Delete the currently signed-in user
	  
      Auth.$deleteUser().then(function() {
        $scope.message = "User deleted";
      }).catch(function(error) {
        $scope.error = error;
      });
    };

    $scope.login = function() {
	$signin_email = $scope.email;
	$signin_password = $scope.password;

	// sign in
    Auth.$signInWithEmailAndPassword($signin_email, $signin_password)
        .then(function(firebaseUser) {
		  //alert(firebaseUser.email + " logged in successfully!");
		  //get current user if signed in
		  var user = firebase.auth().currentUser;
		  var path = "/Users/" + user.uid;
		  var databaseRef = firebase.database().ref(path);
		  databaseRef.on("value", function(snapshot) {
		  var data = snapshot.val();
		  $window.localStorage.setItem("FirstName", data.FirstName);
		  $state.go('tabs.home');
		});

        }).catch(function(error) {		    
		   $ionicPopup.alert({
			title: 'Login Error!',
			template: error.message
		});		
        })  
		};

  });

// Added and $stateParams to injected dependencies
app.controller('homeCtrl', function($scope, $state, $q, $ionicViewSwitcher,
    $ionicScrollDelegate, filterFilter, $location, $anchorScroll, $window) {

  var places = [];
  var currentCharCode = ' '.charCodeAt(0) - 1;

  $scope.fname = $window.localStorage.getItem("FirstName");
  $scope.$apply;

  // Fetch the cities data from backend.
  var deferred = $q.defer();

  var database = firebase.database();
  var databaseRef = database.ref("/Cities/");
  $scope.places = [];
  databaseRef.on('value', function(snapshot) {
    var data = snapshot.val();
    for(var key in data) {
      var cityData = {"id":key,"city":data[key]["city"],
        "state":data[key]["state"],"country":data[key]["country"], "image":data[key]["bannerLink"]};
      $scope.places.push(cityData);
    }
    deferred.resolve($scope.places);
  });

  var promise = deferred.promise;

  promise.then(function(result){
    $scope.places.sort(function(a, b) {
      return a.city > b.city ? 1 : -1;
    })
    .forEach(function(place) {
      //Get the first letter of the city name, and if it changes
      //put the letter in the array
      var cityCharCode = place.city.toUpperCase().charCodeAt(0);
      currentCharCode = cityCharCode;
      places.push(place);
    });
	}
	,function(reason){
		alert('Error: ' + reason );
	})

  // Item height
  $scope.getItemHeight = function(item) {
    return 60;
  };

  $scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop();
  };

  $scope.scrollBottom = function() {
    $ionicScrollDelegate.scrollBottom();
  };

  var letterHasMatch = {};
  $scope.getPlaces = function() {
    letterHasMatch = {};
    //Filter items by $scope.search.
    //Additionally, filter letters so that they only show if there
    //is one or more matching item
    return places.filter(function(item) {
      var itemDoesMatch = !$scope.search ||
       item.city.toLowerCase().startsWith($scope.search.toLowerCase()) ||
       item.state.toLowerCase().startsWith($scope.search.toLowerCase());

      if (itemDoesMatch) {
        var letter = item.city.charAt(0).toUpperCase();
        if ( item.city.charCodeAt(0) < 65 ) {
          letter = "#";
        }
        letterHasMatch[letter] = true;
      }

      return itemDoesMatch;
    });
  };

  $scope.clearSearch = function() {
    $scope.search = '';
  };

  $scope.onSelect = function(id) {
    console.log('selected');
    $ionicViewSwitcher.nextDirection('forward');
		$state.go("tabs.citySelected", {'cityId': id});
  }

  $scope.onNotFound = function(id) {
    console.log('selected');
    $ionicViewSwitcher.nextDirection('forward');
		$state.go("tabs.map", {'cityId': id});
  }

  $scope.signout = function() {
    firebase.auth().signOut().then(function() {
      //alert("Signed out successfully");
	    $ionicViewSwitcher.nextDirection('backward');
      $state.go("tabs.login");
      location.reload();
    })
	  .catch(function(error) {
		  //alert(error.message);
    });
  }

});
app.controller("toursListView", function($scope, $rootScope, $window, $state, $stateParams, $ionicViewSwitcher,
  $ionicScrollDelegate, filterFilter, $location, $anchorScroll, $ionicLoading, $timeout, $ionicHistory) {

  if ($stateParams.cityId != "")
    $window.localStorage.setItem("cityId", $stateParams.cityId);
  else
    $stateParams.cityId = $window.localStorage.getItem("cityId");

  console.log("*******************");
  console.log($stateParams.cityId);
  console.log("*******************");

  // Setup the loader
  $ionicLoading.show({
  	template: '<ion-spinner icon="ios"></ion-spinner> Loading...' ,
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
  });

  $timeout(function () {
    $ionicLoading.hide();
    //$scope.stooges = [{name: 'Moe'}, {name: 'Larry'}, {name: 'Curly'}];
  }, 500);

    $scope.cityId = $stateParams.cityId
    if ($stateParams.cityId != '') {
		  $window.localStorage.setItem("cityId", $stateParams.cityId);
    }
    else {
      $scope.cityId = $window.localStorage.getItem("cityId");
    }

  // fetch the list of tour cards from backend
  var database = firebase.database();
  var databaseRef = database.ref("/Cities/" + String($scope.cityId));

  $scope.tourCards = [];

  var allTours = {};
  var city = "";
  var state = "";

  databaseRef.on('value', function(snapshot) {
    var data = snapshot.val();
    $scope.imageUrl = data['bannerLink'];
    $scope.bannerName = data['city'] + ', ' + data['state'];
    $scope.city = data['city'];
    var cardsData = data['tours'];
    for(var key in cardsData) {
      var tour = cardsData[key];
      var card = {"id":key, "city":$scope.city, "title":tour["title"], "numSights":tour["numSites"],
          "estdTourTime":tour["time"], "estdTourCost":tour["cost"], "ratings":tour["ratings"],
          "image":tour["images"], "source":tour["source"], "destination":tour["destination"],
          "waypoints": tour["waypoints"]};
      $scope.tourCards.push(card);
      // Store places for later use.
      allTours[key] = tour;
    }
    city = data['city'];
    state = data['state'];
  });

  $scope.createTourClicked = function() {
    console.log('selected Tour clicked');
    $ionicViewSwitcher.nextDirection('forward');
    $state.go("tabs.map", {'cityId':$scope.cityId, 'bannerName':$scope.bannerName, 'city':$scope.city});
  };

  $scope.onSelect = function(tourId) {
    console.log('selected tour');
    $ionicViewSwitcher.nextDirection('forward');
//    $state.go("tabs.tour", {'source': src, 'destination': dest, 'waypoints': waypts});
    var tourInfo = allTours[tourId];
    $state.go("tabs.reviews", {'tourInfo': tourInfo, 'city': city, 'state': state, 'cityId': $scope.cityId});
  }

  // Go back button.
  $scope.backClicked = function() {
//    console.log("==============");
//    $ionicHistory.goBack(-1);
    console.log("back clicked");
    $ionicViewSwitcher.nextDirection('backward');
    $state.go("tabs.home");
    location.reload();
  };
});

// Controller to display the tour details as you click on a tour card.
app.controller('reviewsViewCtrl', function($scope, $state, $stateParams, $ionicViewSwitcher, $ionicLoading, $timeout) {

  // Setup the loader
  $ionicLoading.show({
	template: '<ion-spinner icon="ios"></ion-spinner> Loading...' ,
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

	$timeout(function () {
    $ionicLoading.hide();
    //$scope.stooges = [{name: 'Moe'}, {name: 'Larry'}, {name: 'Curly'}];
  }, 1000);

  var mapOptions = {
    center: {lat: 0, lng: 0},
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.LEFT_BOTTOM
    }
  };

  var markers = [];

  var places = [];
  var tourInfo = $stateParams['tourInfo'];
  var waypoints = tourInfo['waypoints'];
  var source = tourInfo['source'];
  var destination = tourInfo['destination'];

  $scope.title = tourInfo['title'];
  $scope.ratings = tourInfo['ratings'];
  $scope.estdTourCost = tourInfo['cost'];
  $scope.estdTourTime = tourInfo['time'];

  $scope.city = $stateParams['city'];
  $scope.state = $stateParams['state'];

  // Gather all sites in places array.
  places.push(tourInfo['source']);
  places.push(tourInfo['destination']);
  for (var id in waypoints) {
    places.push(waypoints[id]);
  }

  $scope.map = new google.maps.Map(document.getElementById("reviews-view-map"), mapOptions);
  var navigateButton = document.getElementById('create-tour-button');
  $scope.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(navigateButton);

  // Go back button.
  var backButton = document.getElementById('map-back-button');
  $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(backButton);

  // For averaging the center of the map.
  var avgLat = 0;
  var avgLng = 0;
  var nSites = 0;

  google.maps.event.addListenerOnce($scope.map, 'idle', function() {
    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place_id) {
      // Use the service to get the places details. Just a demo.
      var service = new google.maps.places.PlacesService($scope.map);
      service.getDetails({
        placeId: place_id
      }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {

          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }

          avgLat += place.geometry.location.lat();
          avgLng += place.geometry.location.lng();
          nSites += 1;

          // Recenter the map.
          $scope.map.setCenter({lat: avgLat/nSites, lng: avgLng/nSites});

          // Create a marker for each place.
          var marker = new google.maps.Marker({
            map: $scope.map,
            title: place.name,
            position: place.geometry.location,
          });

          // Create content for the marker info window.
          var contentString = document.createElement('div'), button;
          contentString.innerHTML = place.name;

          // Add rating if available.
          if (place.rating)
            contentString.innerHTML += "<p align='left'><b>Rating: " + place.rating + '</b></p>';

          // Listener to what happens when the user clicks on the marker.
          google.maps.event.addListener(marker, 'click', function() {
            var infoWindow = new google.maps.InfoWindow({
              content: contentString
            });
            infoWindow.open($scope.map, this);
          });

          // Add to the global markers array.
          markers.push(marker);

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        }
      });
    });

    // Load Reviews;
    loadReviews();
  });

  $scope.reviews = [];

  var loadReviews = function() {
    var reviews = tourInfo['reviews'];
    for (var reviewId in reviews) {
      $scope.reviews.push(reviews[reviewId]);
    }
    $scope.$apply();
  }

  $scope.startNavigation = function() {
    $ionicViewSwitcher.nextDirection('forward');
    $state.go("tabs.tour", {
      'cityId': $stateParams.cityId,
      'source': source,
      'destination': destination,
      'waypoints': waypoints
    });
  }

  // Go back button.
  $scope.backClicked = function() {
    $ionicViewSwitcher.nextDirection('forward');
    $state.go("tabs.citySelected", {'cityId': $stateParams.cityId});
    location.reload();
  };

});

app.controller('mapCtrl', function($scope, $state, $stateParams, $ionicViewSwitcher,
  $cordovaGeolocation, $cordovaToast, $ionicLoading, $timeout) {

    // Setup the loader
    $ionicLoading.show({
  	template: '<ion-spinner icon="ios"></ion-spinner> Loading...' ,
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  	$timeout(function () {
      $ionicLoading.hide();
      //$scope.stooges = [{name: 'Moe'}, {name: 'Larry'}, {name: 'Curly'}];
    }, 1000);

  var geocoder =  new google.maps.Geocoder();
  geocoder.geocode({'address': $stateParams.city}, function(results, status) {
	  if (status == google.maps.GeocoderStatus.OK) {
		  latLng = new google.maps.LatLng(results[0].geometry.location.lat(),results[0].geometry.location.lng());
	    var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
      };

      // Create a maps object.
      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      google.maps.event.addListenerOnce($scope.map, 'idle', function(){
        var marker = new google.maps.Marker({
            map: $scope.map,
            clickable: false,
            icon: '../img/location_icon.png',
            shadow: null,
            zIndex: 999,
            animation: google.maps.Animation.DROP,
            position: latLng
        });
      });

      // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      input.value = "tourist attractions near " + $stateParams.bannerName + "\n";

      var searchBox = new google.maps.places.SearchBox(input);
      $scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

      $scope.map.addListener('bounds_changed', function() {
        searchBox.setBounds($scope.map.getBounds());
      });

      // Add the tour save button.
      var saveButton = document.getElementById('create-tour-button');
      $scope.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(saveButton);

      var backButton = document.getElementById('map-back-button');
      $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(backButton);

      var centerLatLng = {'lat':0, 'lng':0};
      var sitesSelected = new Set();
      var nSites = 0;

      // Function to add the selected place to the tours list.
      function addToTour(place, marker) {
        centerLatLng.lat += marker.getPosition().lat();
        centerLatLng.lng += marker.getPosition().lng();
          nSites++;

        sitesSelected.add(place.place_id);
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
        // remove from the global markers array.
        var idx = 0;
        for (var i = 0; i < markers.length; i++) {
          if (markers[i] === marker) {
            idx = i;
            break;
          }
        }
        markers.splice(idx, 1);
        $scope.$apply();
      }

      $scope.tourSelectionDone = function() {
        centerLatLng.lat /= nSites;
        centerLatLng.lng /= nSites;
        $ionicViewSwitcher.nextDirection('forward');
        $state.go("tabs.finalizeTour", {'sitesSelected': sitesSelected, 'center': centerLatLng});
      }

      // Global array of markers for corresponding places.
      var markers = [];

      function clearMarkers() {
        // Clear out the old markers.
        markers.forEach(function(marker) {
          marker.setMap(null);
        });
        markers = [];
      }

      // Listener to create marker on any place that a user clicks on the map.
      google.maps.event.addListener($scope.map, 'click', function(event) {
        var marker = new google.maps.Marker({
          position: event.latLng,
          map: $scope.map
        });
        google.maps.event.addListener(marker, 'dblclick', function() {
            marker.setMap(null);
        });
      });

      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        clearMarkers();

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }

          // Use the service to get the places details. Just a demo.
          var service = new google.maps.places.PlacesService($scope.map);
          service.getDetails({
            placeId: place.place_id
          }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              // Create a marker for each place.
              var marker = new google.maps.Marker({
                map: $scope.map,
                title: place.name,
                position: place.geometry.location,
              });

              // Create content for the marker info window.
              var contentString = document.createElement('div'), button;
              contentString.innerHTML = place.name;
              if (place.rating)
                contentString.innerHTML += "<p align='left'><b>Rating: " + place.rating + '</b></p>';
              button = contentString.appendChild(document.createElement('input'));
              button.type = 'button';
              button.value = 'Add';
              button.id = 'custom-button'
              button.className = 'button button-small button-positive';

              // Listener to what happens when the button is clicked.
              google.maps.event.addDomListener(button, 'click', function() {
                addToTour(place, marker);
                infoWindow.close();
              });

              var infoWindow;
              // Listener to what happens when the user clicks on the marker.
              google.maps.event.addListener(marker, 'click', function() {
                infoWindow = new google.maps.InfoWindow({
                  content: contentString
                });
                infoWindow.open($scope.map, this);
              });

              // Remove the marker when double clicked.
              google.maps.event.addListener(marker, 'dblclick', function() {
                  marker.setMap(null);
              });

              // Add to the global markers array.
              markers.push(marker);
            }
          });

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }

        });
        $scope.map.fitBounds(bounds);
      });
    }
  });

  // Go back button.
  $scope.backClicked = function() {
    console.log("back clicked");
    $ionicViewSwitcher.nextDirection('forward');
    if ($stateParams.cityId != "NotFound")
    {
      $state.go("tabs.citySelected", {'cityId': $stateParams.cityId});
    }
    else
    {
      $state.go("tabs.home");
    }
      location.reload();
  };
});

app.controller('tourCtrl', function($scope, $state, $stateParams, $cordovaGeolocation,
 $timeout, $ionicLoading, $ionicViewSwitcher, $ionicViewService, $ionicHistory) {

  // Setup the loader
  $ionicLoading.show({
	template: '<ion-spinner icon="ios"></ion-spinner> Loading...' ,
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

	$timeout(function () {
    $ionicLoading.hide();
    //$scope.stooges = [{name: 'Moe'}, {name: 'Larry'}, {name: 'Curly'}];
  }, 2000);

 var waypoints = [];
  for(var key in $stateParams.waypoints) {
      var way_pt = {location: {'placeId': $stateParams.waypoints[key]}};
	  waypoints.push(way_pt);
	  console.log($stateParams.waypoints[key]);
    }

  var options = {timeout: 10000, enableHighAccuracy: true};

  var latLng = new google.maps.LatLng(0.0, 0.0);

  $scope.map = new google.maps.Map(document.getElementById('tourMap'), {
    zoom: 4,
    center: latLng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.LEFT_BOTTOM
    }
  });

  var backButton = document.getElementById('direction-back-button');
  $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(backButton);

  google.maps.event.addListenerOnce($scope.map, 'idle', function(){
	  var directionsService = new google.maps.DirectionsService;
	  var directionsDisplay = new google.maps.DirectionsRenderer({
		draggable: true,
		map: $scope.map,
		panel: document.getElementById('right-panel')
	  });

	  directionsDisplay.addListener('directions_changed', function() {
		computeTotalDistance(directionsDisplay.getDirections());
	  });

  displayRoute($stateParams.source, $stateParams.destination, waypoints, directionsService, directionsDisplay);
  });


function displayRoute(origin, destination, way_pts, service, display) {
  service.route({
    origin: {'placeId': origin},
    destination: {'placeId':destination},
    waypoints: way_pts,
    travelMode: 'DRIVING',
    avoidTolls: true
  }, function(response, status) {
    if (status === 'OK') {
      display.setDirections(response);
    } else {
      alert('Could not display directions due to: ' + status);
    }
  });
}

  function computeTotalDistance(result) {
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
      total += myroute.legs[i].distance.value;
    }
    total = total / 1000;
    document.getElementById('total').innerHTML = total + ' km';
  }

  // Go back button.
  $scope.backClicked2 = function() {
    console.log("==================");
    console.log($stateParams.cityId);
    console.log("=================");
    $ionicHistory.goBack(-2);
//
//    $ionicHistory.goBack({'cityId': $stateParams.cityId});
//    $ionicViewSwitcher.nextDirection('backward');
//    $state.go("tabs.citySelected", {'cityId': $stateParams.cityId});
//    location.reload();
  };


});

// Controller for the finalizeTour page.
app.controller('finalizeTourCtrl', function($scope, $rootScope, $state, $ionicViewSwitcher,
  $stateParams, $cordovaGeolocation, $q) {

  var mapOptions = {
    center: $stateParams['center'],
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.LEFT_BOTTOM
    }
  };

  // Create a maps object.
  $scope.map = new google.maps.Map(document.getElementById("tour-map"), mapOptions);
  var markers = [];
  var places = Array.from($stateParams['sitesSelected']);
  // TODO: Should we use the sorting method? -- how do we select source and destination addresses?
  places.sort();

  // The dictionary to store locality, state and country for each of the places id.
  var placesAddressData = {};

  // Function to get the address data from a given place object.
  var getPlaceAddressData = function(place) {
    var result = {};
    var addressComponents = place['address_components'];
    addressComponents.forEach(function(item) {
      if (item['types'][0] === 'locality') {
        result['locality'] = item['long_name'];
      }
      else if (item['types'][0] === 'administrative_area_level_1') {
        result['state'] = item['long_name'];
      }
      else if (item['types'][0] === 'country') {
        result['country'] = item['long_name'];
      }
    });

    return result;
  }

  // Store photos corresponding to the places.
  var placesPhotos = {};

  google.maps.event.addListenerOnce($scope.map, 'idle', function() {
    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place_id) {
      // Use the service to get the places details. Just a demo.
      var service = new google.maps.places.PlacesService($scope.map);
      service.getDetails({
        placeId: place_id
      }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {

          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }

          // Get the photos if they exist.
          if (place.photos) {
            var photos = place.photos;
            placesPhotos[place_id] = photos[0].getUrl({'maxWidth': 512, 'maxHeight': 512});
            console.log(placesPhotos[place_id]);
          }

          // Create a marker for each place.
          var marker = new google.maps.Marker({
            map: $scope.map,
            title: place.name,
            position: place.geometry.location,
          });

          // Create content for the marker info window.
          var contentString = document.createElement('div'), button;
          contentString.innerHTML = place.name;

          // Add to the places_address_data dictionary to store the places address details.
          placesAddressData[place_id] = getPlaceAddressData(place);

          console.log(place);
          if (place.rating)
            contentString.innerHTML += "<p align='left'><b>Rating: " + place.rating + '</b></p>';

          // Listener to what happens when the user clicks on the marker.
          google.maps.event.addListener(marker, 'click', function() {
            var infoWindow = new google.maps.InfoWindow({
              content: contentString
            });
            infoWindow.open($scope.map, this);
          });

          // Remove the marker when double clicked.
          google.maps.event.addListener(marker, 'dblclick', function() {
              marker.setMap(null);
          });

          // Add to the global markers array.
          markers.push(marker);

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        }
      });
    });
  });

  // Method to call when user submits all the required info from the tour finalize page.
  $scope.finalizeTour = function(title, cost, time, rating, review) {
    console.log("Inside finalize Tour");
    // Get the city, state and country info here.
    var firstKey = Object.keys(placesAddressData)[0];
    var data = placesAddressData[firstKey];
    var city = data['locality'];
    var state = data['state'];
    var country = data['country'];

    var source = places[0];
    var destination = places[places.length - 1];
    var numSites = places.length;
    var images = placesPhotos;

    var waypoints = {};

    for (var i = 1; i < places.length - 1; i++) {
      waypoints[i] = places[i];
    }
    // Create a tour id. It must be the function of places marked.
    var placesIdString = "";
    places.forEach(function(item) {
      placesIdString += item;
    });
    var tourId = "tour" + String(placesIdString.hashCode());
    var cityId = "cityId" + String(String(city+state+country).hashCode());

    var keyword = city + " " + state + " image";
    var restEndpoint =
    "https://www.googleapis.com/customsearch/v1?key=AIzaSyAYUMC8P6Y0n5STDsH5Rkv79zbjlZFluK8&cx=007501535424377314441:bxm9ky_aric";
    var params = "&searchType=image&fileType=jpg&alt=json";

    var queryUrl = restEndpoint + "&q=" + keyword.replace(/\s/g, '+') + params;

    // Deferred object to fetch image search results.
    var deferred = $q.defer();

		$.getJSON(queryUrl, function(data) {
      var bannerImageUrl = data.items[0].link;
      deferred.resolve(bannerImageUrl);
    });

    var promise = deferred.promise;

    // Once we get the image url, write to the database.
    promise.then(function(bannerImageUrl) {
      var ref = firebase.database().ref('/Cities/');
      ref.child(cityId).once('value', function(snapshot) {
          // If cityId already exists then we don't need to update the banner link.
          if (snapshot.exists()) {
            var toursRef = snapshot.child(cityId + "/tours/").ref;
            toursRef.child(tourId).once('value', function(snapshot) {
                // Tour Id already exists.
                if (snapshot.exists()) {
                  // Do nothing. TODO: Should we update this?
                }
                else {
                  // Append a new tour.
                  var tourData = {};
                  tourData['/Cities/' + cityId + '/tours/' + tourId + '/'] = getTourData();
                  firebase.database().ref().update(tourData).then(function() {
                    $scope.backClicked();
                  });
                }
              });
          }
          else {
            // Cityid doesn't exist.
            var cityData = getCityData(bannerImageUrl);
            var updates = {};
            updates['/Cities/' + cityId + '/'] = cityData;
            firebase.database().ref().update(updates).then(function() {
              $scope.backClicked();
            });
          }
        });
    });

    var getTourData = function() {
      var tourData = {};
      var reviewId = guid();
      var reviews = {};
      reviews[reviewId] = review;

      tourData = {
        cost: "$" + String(cost),
        destination: destination,
        images: images,
        numSites: numSites,
        published: true,
        ratings: rating,
        source: source,
        time: time,
        title: title,
        waypoints: waypoints,
        reviews: reviews
      };
      return tourData;
    };

    var getCityData = function(bannerImageUrl) {
      var tourData = {};
      tourData[tourId] = getTourData();
      var cityData = {};
      cityData = {
        bannerLink: bannerImageUrl,
        city: city,
        country: country,
        state: state,
        tours: tourData
      };
      return cityData;
    };

     $scope.backClicked = function() {
      $ionicViewSwitcher.nextDirection('forward');
      $state.go("tabs.home");
      location.reload();
    };

  }
});

// Implementing hashCode for the string.
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// GUID stuff.
function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}