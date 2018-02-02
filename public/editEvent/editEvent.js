'use strict';

angular.module('YandexRooms.editEvent', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/editEvent', {
    templateUrl: 'editEvent/editEvent.html',
    controller: 'editEventCtrl'
  });
}])

.controller('editEventCtrl', [function() {

}]);