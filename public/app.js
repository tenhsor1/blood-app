'use strict';

// Declare app level module which depends on views, and components
angular.module('BloodApp', [
  'ngRoute',
  'ngMessages',
  'BloodApp.map',
  'BloodApp.services',
  'btford.socket-io'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
}])
.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode(true);
}]);
