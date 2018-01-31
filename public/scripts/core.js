

var YRooms = angular.module('YRooms',[]);

YRooms.factory('YRoomSharedService', function($rootScope) {
  var sharedService = {};

  sharedService.message = '';

  sharedService.prepForBroadcast = function(msg) {
    this.message = msg;
    this.broadcastItem();
  };

  sharedService.broadcastItem = function() {
    $rootScope.$broadcast('handleBroadcast');
  };

  return sharedService;
});

function mainController($scope,$sharedService){
    $scope.changedate = function(i)
    {
        if(i==-1)
        {
            $scope.currentDate.setDate($scope.currentDate.getDate()-1);
        }
        else
        {
            $scope.currentDate.setDate($scope.currentDate.getDate()+1);
        }
        $scope.monthName = months[$scope.currentDate.getMonth()];
        process($scope);
    }
    $scope.createEventFromScratch = function(){        
    };
    $scope.createEvent = function(dateStart,dateEnd){
        
    };

    $scope.editEvent = function(eventId){
        
    };
    
    $scope.getNumber = function(){        
        return [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    }

    $scope.currentDate = new Date();    
    $scope.monthName = months[$scope.currentDate.getMonth()];    



    process($scope);   

}

function process($scope){    
    
    console.log($scope.currentDate);
    $scope.startOfDay = new Date($scope.currentDate.getFullYear(),$scope.currentDate.getMonth(),$scope.currentDate.getDate(), 8,0,0,0);    
    console.log($scope.startOfDay);
    $scope.endOfDay = new Date($scope.currentDate.getFullYear(),$scope.currentDate.getMonth(),$scope.currentDate.getDate(), 23,59,59,999);    
    console.log($scope.endOfDay);

    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open("POST", "/graphql");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onload = function () {
        
        $scope.rooms = xhr.response.data.rooms;


        xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open("POST", "/graphql");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.onload = function () {
            $scope.$apply(function(){
                $scope.events = xhr.response.data.events;

                $scope.events = $scope.events.filter(function(evnt){
                    return ((Date.parse(evnt.dateStart) >= $scope.startOfDay) && (Date.parse(evnt.dateStart) <= $scope.endOfDay));
                })

                

                $scope.rooms.map(function(room){
                    var roomEvents = [];
                    $scope.events.forEach(function(event,i,arr){
                        if(event.room.id == room.id)
                        {
                            event.dateStart = new Date(event.dateStart);
                            event.dateEnd = new Date(event.dateEnd);
                            event.occupied = true;
                            roomEvents.push(event);                            
                        }
                    });
                    roomEvents.sort(compare);
                    room.events = roomEvents;

                    room.timeslots = [];


                    roomEvents.forEach(function(event,i,arr){
                        var prevEvent = roomEvents[i-1];
                        if(prevEvent != null)
                        {
                            var emptySlot = {};
                            emptySlot.dateStart = prevEvent.dateEnd;
                            emptySlot.dateEnd = event.dateStart;
                            emptySlot.occupied = false;
                            room.timeslots.push(emptySlot);
                        }
                        else
                        {
                            //Заполняем промежутки между событиями пустыми слотами
                            if(event.dateStart > $scope.startOfDay)
                            {                            
                                var emptySlot = {};
                                emptySlot.dateStart = $scope.startOfDay;
                                emptySlot.dateEnd = event.dateStart;
                                emptySlot.occupied = false;
                                room.timeslots.push(emptySlot);
                            }
                        }                        
                        
                        room.timeslots.push(event);

                        if(i == roomEvents.length-1 && event.dateEnd <$scope.endOfDay)
                        {
                            var emptySlot = {};
                            emptySlot.dateStart = event.dateEnd;
                            emptySlot.dateEnd = $scope.endOfDay;
                            emptySlot.occupied = false;
                            room.timeslots.push(emptySlot);
                        }
                    });
                    if(roomEvents.length == 0)
                    {
                        var emptySlot = {};
                        emptySlot.dateStart = $scope.startOfDay;
                        emptySlot.dateEnd = $scope.endOfDay;
                        emptySlot.occupied = false;
                        room.timeslots.push(emptySlot);
                    }
                });//map end

                console.log($scope.rooms);
            });
        }
        var querystr = `query{events{id, title, dateStart,dateEnd,users{login},room{id,title}}}`;
        var s = JSON.stringify({query:querystr});
        xhr.send(s); 
        
    }
    var querystr = `query{rooms{id, title,capacity,floor}}`;
    var s = JSON.stringify({query:querystr});
    xhr.send(s); 
}

var months = [
'Января',
'Февраля',
'Марта',
'Апреля',
'Мая',
'Июня',
'Июля',
'Августа',
'Сентября',
'Октября',
'Ноября',
'Декабря'
];


function eventController($scope,$sharedService){
}





function compare(e1,e2)
{
    if(e1.dateStart>e2.dateStart)
        return 1;
    if(e1.dateStart<e2.dateStart)
        return -1;
    return 0;
}

mainController.$inject = ['$scope', 'YRoomSharedService'];        

eventController.$inject = ['$scope', 'YRoomSharedService'];



// Declare app level module which depends on views, and components
// var YandexRooms = angular.module('YandexRooms', [
//   'ngRoute',
//   'YandexRooms.mainView',
//   'YandexRooms.editEvent'
// ])
//  .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
//  	$locationProvider.html5Mode(true);
//  	$locationProvider.hashPrefix('!');

// 	$routeProvider.otherwise({redirectTo: '/mainView'});
// }]);


// function eventController($scope, $http,$location,$routeParams) {  
// 	$scope.showDetails = function(eventId){
// 			$scope.eventId = eventId;
// 			$scope.details = "editEvent/editEvent.html";
//             //$location.path("editEvent"); // path not hash
//         }

// }


// var YandexRooms = angular.module('YandexRooms', [])
// .config(function($locationProvider){
//     $locationProvider.html5Mode(true);
// });
// function eventController($scope, $http,$location,$routeParams) {    
    
//     $scope.formData = {};
//     $scope.content = null;

//     $scope.deleteEvent = function(eventId){

//         var xhr = new XMLHttpRequest();
//         xhr.responseType = 'json';
//         xhr.open("POST", "/graphql");
//         xhr.setRequestHeader("Content-Type", "application/json");
//         xhr.setRequestHeader("Accept", "application/json");
//         xhr.onload = function () {
//           console.log('data returned:', xhr.response);
//         }

//         var querystr = 'mutation{removeEvent(id:'+eventId+'){id}}';
//         var s = JSON.stringify({query:querystr});
//         xhr.send(s);
//     };

//     $scope.updateEvent = function(){

//         var xhr = new XMLHttpRequest();
//         xhr.responseType = 'json';
//         xhr.open("POST", "/graphql");
//         xhr.setRequestHeader("Content-Type", "application/json");
//         xhr.setRequestHeader("Accept", "application/json");
//         xhr.onload = function () {
//           console.log('data returned:', xhr.response);
//         }

//         var querystr = `mutation{updateEvent(id:${$scope.formData.eventId}){id}}`;
//         var s = JSON.stringify({query:querystr});
//         xhr.send(s);
//     };

//     $scope.showDetails = function(eventId){
//         $http.get('/getDetails')
//             .success(function (response) {
//                 console.log(response);

//                 $scope.content = response; 
//         });
//         var xhr = new XMLHttpRequest();
//         xhr.responseType = 'json';
//         xhr.open("POST", "/graphql");
//         xhr.setRequestHeader("Content-Type", "application/json");
//         xhr.setRequestHeader("Accept", "application/json");
//         xhr.onload = function () {
            
//             $scope.title = xhr.response.data.event.room.title;
//             console.log(xhr.response.data.event.room.title);
                    
//         }

//         var querystr = `query{event(id:${eventId}){id, title, dateStart, dateEnd, users{login}, room{title}}}`;
//         var s = JSON.stringify({query:querystr});
//         xhr.send(s);
//     };
// }
