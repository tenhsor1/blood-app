'use strict';

angular.module('BloodApp.map', ['geolocation', 'BloodApp.services'])
.controller('FormCtrl', [
  '$scope',
  '$http',
  '$rootScope',
  '$location',
  '$sce',
  'geolocation',
  'mapService',
  function($scope, $http, $rootScope, $location, $sce, geolocation, mapService) {
    $scope.formData = {};
    $scope.donor = {
      bloodType: 'O+'
    };
    var coords = {};
    var lat = 0;
    var long = 0;

    //check if the 'user' param is sent in the query, if sent, then show the edit form
    var queryParams = $location.search();
    if(queryParams.user){
      if(typeof queryParams.user == 'string'){
        //if the user id is correct, then do a request to the API, to get the donor info
        '/donors/' + queryParams.user
        $http.get('/donors/' + queryParams.user)
        .success(function(data){
          if(data){
            if(data._id){
              $scope.donor = {
                id: data._id,
                firstName: data.first_name,
                lastName: data.last_name,
                email: data.email,
                contactNumber: data.contact_number,
                address: data.address,
                bloodType: data.blood_type,
                latitude: data.location[1],
                longitude: data.location[0]
              };
              $('#modal-edit-form').modal('show');
            }else{
              $scope.failureMessage = 'The user does\t exist';
              $('#modal-failure').modal('show');
            }
          }else{
            $scope.failureMessage = 'The user does\t exist';
            $('#modal-failure').modal('show');
          }

        })
        .error(function(data){
          $scope.failureMessage = 'There was an error retrieving the user information';
          $('#modal-failure').modal('show');
        });
      }else{
        $scope.failureMessage = 'The user id is not valid';
        $('#modal-failure').modal('show');
      }
    }

    $scope.submitDonor = function(){
      //if there is information in the donor model, then send it to the API
      if($scope.donor){
        var donorData = {
          first_name: $scope.donor.firstName,
          last_name: $scope.donor.lastName,
          email: $scope.donor.email,
          contact_number: $scope.donor.contactNumber,
          address: $scope.donor.address,
          blood_type: $scope.donor.bloodType,
          location: [$scope.donor.longitude, $scope.donor.latitude]
        };
        $http.post('/donors', donorData)
          .success(function(data){
            //if the donor was saved correctly, then clear the model
            $scope.donor.firstName = '';
            $scope.donor.lastName = '';
            $scope.donor.email = '';
            $scope.donor.contactNumber = '';
            $scope.donor.address = '';
            //repopulate the map, so it shows the new donor
            mapService.populateMap();
            mapService.unsetClickMarker();

            $('#modal-form').modal('hide');
            var message = 'Congratulations! Now you are a blood donor!'+
                                    '<br>On this link you can edit and remove your account: '+
                                    '<a href="/?user=' + data._id + '" target="_blank">My Account</a>';
            $scope.successMessage = $sce.trustAsHtml(message);
            $('#modal-success').modal('show');

          })
          .error(function (data) {
            $scope.failureMessage = data.message;
            $('#modal-failure').modal('show');
          });
      }

    };

    $scope.editDonor = function(){
      //if there is information in the donor model, then send it to the API
      if($scope.donor && $scope.donor.id){
        var donorData = {
          first_name: $scope.donor.firstName,
          last_name: $scope.donor.lastName,
          email: $scope.donor.email,
          contact_number: $scope.donor.contactNumber,
          address: $scope.donor.address,
          blood_type: $scope.donor.bloodType,
          location: [$scope.donor.longitude, $scope.donor.latitude]
        };
        $http.put('/donors/' + $scope.donor.id, donorData)
          .success(function(data){
            //if the donor was updated correctly, then clear the model
            $scope.donor.firstName = data.first_name;
            $scope.donor.lastName = data.last_name;
            $scope.donor.email = data.email;
            $scope.donor.contactNumber = data.contact_number;
            $scope.donor.address = data.address;

            $('#modal-edit-form').modal('hide');
            $scope.successMessage = 'Your information was updated succesfully!';
            $('#modal-success').modal('show');
          })
          .error(function (data) {
            $scope.failureMessage = data.message;
            $('#modal-failure').modal('show');
          });
      }
    };

    $scope.deleteDonor = function(){
      if($scope.donor && $scope.donor.id){
        $http.delete('/donors/' + $scope.donor.id)
        .success(function(data){
          //if the donor was updated correctly, then clear the model
          $scope.donor = {};

          $('#modal-edit-form').modal('hide');
          $scope.successMessage = 'Donor deleted correctly!';
          $('#modal-success').modal('show');
        })
        .error(function (data) {
          $scope.failureMessage = data.message;
          $('#modal-failure').modal('show');
        });
      }
    };

    $rootScope.$on("mapClicked", function(){
      // Run the mapService functions associated with identifying coordinates
    $scope.$apply(function(){
          $scope.donor.latitude = parseFloat(mapService.clickLat);
          $scope.donor.longitude = parseFloat(mapService.clickLong);
      });
    });
  }
])
.controller('MapCtrl', [
  '$rootScope',
  '$scope',
  '$http',
  'geolocation',
  'mapService',
  'socketService',
  function($rootScope, $scope, $http, geolocation, mapService, socketService){
    //listen for update event using sockets
    $scope.$on('socket:update', function (ev, data) {
      mapService.updateDonor(data);
    });
    //listen for delete event, and refresh the map if the user deleted is inside the bounds
    $scope.$on('socket:delete', function (ev, donorId) {
      mapService.updateMap(donorId);
    });
    //initialize the map in Levi's Stadium
    $scope.centerLatitude = 37.4030839;
    $scope.centerLongitude = -121.972022;
    mapService.refresh($scope.centerLatitude, $scope.centerLongitude);
    geolocation.getLocation().then(function(data){
      // Set the latitude and longitude equal to the HTML5 coordinates
      var coords = {lat:data.coords.latitude, long:data.coords.longitude};

      // Display coordinates in location textboxes rounded to three decimal points
      $scope.centerLatitude = parseFloat(coords.lat);
      $scope.centerLongitude = parseFloat(coords.long);
      mapService.refresh($scope.centerLatitude, $scope.centerLongitude);
    });
  }
]);