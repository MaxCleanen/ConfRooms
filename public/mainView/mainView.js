'use strict';

//var MainView = angular.module('YandexRooms.mainView', ['ngRoute']);
var MainView = angular.module('YandexRooms.mainView',[]);
// .config(['$routeProvider', function($routeProvider) {
//   $routeProvider.when('/mainView', {
//     templateUrl: 'mainView/mainView.html',
//     controller: 'mainViewCtrl'
//   });
// }])

// .controller('mainViewCtrl', [function() {

// }]);



MainView.controller("dateController",['$scope', function($scope) {
	$scope.currentDate = new Date();
}]);
MainView.controller("roomController",['$scope', function($scope) {        
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open("POST", "/graphql");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onload = function () {                
        console.log(xhr.response.data.rooms);                
        $scope.rooms = xhr.response.data.rooms;
    }
    var querystr = `query{rooms{title}}`;
    var s = JSON.stringify({query:querystr});
    xhr.send(s);    
}]);

MainView.controller("roomSchedulleController",['$scope', function($scope) {    
}]);