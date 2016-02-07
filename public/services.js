'use strict';

angular.module('BloodApp.services', [])
  .factory('mapService', function($rootScope, $http){
    var googleMapService = {};
    //map handler
    var map;

    // Array of locations got from the API
    var locations = [];

    // Selected Location by default
    var selectedLat = 37.4030839;
    var selectedLong = -121.972022;

    // the last position where the user clicked in the map
    var lastMarker;
    var currentSelectedMarker;

    //current markers and donors inside the bounds of the map
    var visibleLocations = [];
    var visibleMarkers = [];
    $rootScope.visibleDonors = [];


    //Position when the user clicks in a open position on the map
    googleMapService.clickLat  = 0;
    googleMapService.clickLong = 0;

    // Refresh the Map with new donors positions.
    googleMapService.refresh = function(latitude, longitude){

      // First refresh the array of locations
      locations = [];

      // set the selected latitude and longitude to the ones provided by the refresh args
      selectedLat = latitude;
      selectedLong = longitude;

      initialize(latitude, longitude);
    };

    googleMapService.populateMap = function(){
      //first get the bounds of the current position in the map
      var bounds = map.getBounds();
      var topLimit = bounds.getNorthEast();
      var bottomLimit = bounds.getSouthWest();

      //set the parameters to be send with the GET request
      //so only get the donors within the bounds
      var config = {
        params: {
            topLat: topLimit.lat(),
            topLong:topLimit.lng(),
            bottomLat: bottomLimit.lat(),
            bottomLong:bottomLimit.lng()
        }
      };

      $http.get('/donors', config).success(function(response){
        // Convert the donors positions to map LatLng objects
        locations = convertToMapPoints(response);
        setMapPoints(locations);
        $rootScope.visibleDonors = response;
        visibleLocations = locations;
      }).error(function(){
        alert('Error retrieving the donors');
      });
    };

    //remove the blue marker in the map
    googleMapService.unsetClickMarker = function(){
      if(lastMarker){
        lastMarker.setMap(null);
      }
    };

    //used for updating information from a donor in it map mark
    googleMapService.updateDonor = function(donor){
      var i = getDonorPositionById(donor._id);
      if(i !== null){
        $rootScope.visibleDonors[i] = donor;
      }

      i = getMarkPositionById(visibleMarkers, donor._id);
      //update the information for the info window in the map
      if(visibleMarkers[i]){
        visibleMarkers[i].message.setContent(getContentWindow(donor));
      }
    };

    googleMapService.updateMap = function(donorId){
      var i = getDonorPositionById(donorId);
      if(i !== null){
        googleMapService.populateMap();
      }
    };

    // Initializes the map
    var initialize = function(latitude, longitude) {
        // Uses the selected lat, long as starting point
        var myLatLng = {lat: selectedLat, lng: selectedLong};
        // If map has not been created already...
        if (!map){
          // Create a new map and place in the index.html page
          map = new google.maps.Map(document.getElementById('map'), {
              zoom: 15,
              center: myLatLng
          });
        }
        // Loop through each location in the array and place a marker

        map.panTo(new google.maps.LatLng(latitude, longitude));

        //whenever there is a change in the bounds, we load new placemarkers
        google.maps.event.addListener(map, 'idle', function() {
           googleMapService.populateMap();
        });

        // Clicking on the Map will open a modal for creating a new donor record
        google.maps.event.addListener(map, 'click', function(e){
          var marker = new google.maps.Marker({
              position: e.latLng,
              map: map,
              title: "Click again to create a donor account",
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });

          // When a new spot is selected, delete the old blue marker
          googleMapService.unsetClickMarker();

          // Create a new blue marker and move to it
          lastMarker = marker;
          map.panTo(marker.position);
          //broadcast the event of map clicked so that way the formCtrl catch it
          //and save the latitude and longitude in hidden fields
          googleMapService.clickLat = marker.getPosition().lat();
          googleMapService.clickLong = marker.getPosition().lng();

          $rootScope.$broadcast("mapClicked");
          google.maps.event.addListener(lastMarker, 'click', function(e){
            // When clicked, open the form for create a new donor
            $('#modal-form').modal('show');
          });
        });
    };

    var setMapPoints = function(locations){
      var currentDonorIds = [];
      locations.forEach(function(n, i){
          currentDonorIds.push(n.donor_id);
          if(getMarkPositionById(visibleMarkers, n.donor_id) === null){
            var marker = new google.maps.Marker({
              position: n.latlon,
              map: map,
              title: n.first_name,
              icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              donor_id: n.donor_id,
              message: n.message
            });

            // For each marker created, add a listener that checks for clicks
            google.maps.event.addListener(marker, 'click', function(e){
              // When clicked, open the selected marker's message
              visibleMarkers.forEach(function(m,i){ m.message.close(); });
              currentSelectedMarker = n;
              marker.message.open(map, marker);
            });
            visibleMarkers.push(marker);
          }
        });
      deleteNotVisibleMarkers(currentDonorIds);
    };

    var deleteNotVisibleMarkers = function(currentDonorIds){
      visibleMarkers.forEach(function(n, i){
        if(currentDonorIds.indexOf(visibleMarkers[i].donor_id) === -1){
          visibleMarkers[i].setMap(null);
          visibleMarkers.splice(i, 1);
        }
      });
    };

    // Convert a JSON of donors into map LatLng objects
    var convertToMapPoints = function(response){

      // Clear the locations holder
      var locations = [];

      // Loop through all of the JSON entries provided in the response
      for(var i= 0; i < response.length; i++) {
        var donor = response[i];

        // Create popup windows for each record
        var  contentDonorString = getContentWindow(donor);


        // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
        locations.push({
            latlon: new google.maps.LatLng(donor.location[1], donor.location[0]),
            message: new google.maps.InfoWindow({
                content: contentDonorString,
                maxWidth: 320
            }),
            first_name: donor.first_name,
            last_name: donor.last_name,
            email: donor.email,
            address: donor.address,
            contact_number: donor.contact_number,
            donor_id: donor._id
        });
      }
      // location is now an array populated with records in Google Maps format
      return locations;
    };

    var getDonorPositionById = function(donorId){
      for (var i=0; i<$rootScope.visibleDonors.length; i++) {
        if ($rootScope.visibleDonors[i]._id == donorId) return i;
      }
      return null;
    };

    var getMarkPositionById = function(arr, donorId){
      for (var i=0; i<arr.length; i++) {
        if (arr[i].donor_id == donorId) return i;
      }
      return null;
    };

    var getContentWindow = function(donor){
      return '<div id="info-' + donor._id + '">' +
            '<p><b>First Name</b>: <span class="first-name">' + donor.first_name + '</span>' +
            '<br><b>Last Name</b>: <span class="last-name">' + donor.last_name + '</span>' +
            '<br><b>Blood Type</b>: <span class="blood-type">' + donor.blood_type + '</span>' +
            '<br><b>E-mail</b>: ' +
            '<a href="" class="hidden-value info-email" data-value="' + donor.email + '">Click to view</a>' +
            '<br><b>Address</b>: ' +
            '<a href="" class="hidden-value info-address" data-value="' + donor.address + '">Click to view</a>' +
            '<br><b>Contact Number</b>: ' +
            '<a href="" class="hidden-value info-contact-number" data-value="' + donor.contact_number + '">Click to view</a>' +
            '</p></div>';
    };



    google.maps.event.addDomListener(window, 'load',
    googleMapService.refresh(selectedLat, selectedLong));

    return googleMapService;
  })
  .factory('socketService', ['socketFactory', function(socketFactory){
    //create the socket factory and forward all the update and delete events
    //to the $rootScope
    var socket= socketFactory();
    socket.forward('update');
    socket.forward('delete');
    return socket;
  }]);