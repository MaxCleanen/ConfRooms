var YRoomsApp = angular.module('YRoomsApp',["ngRoute","angular.filter"])
    .config(function($routeProvider){
        $routeProvider.when('/editEvent/:eventId?',
        {
            templateUrl:'newEvent.html',
            controller: 'eventController'
        });
        $routeProvider.when('/main/:DateNow?',
        {
            templateUrl:'main.html',
            controller: 'mainController'
        });
        $routeProvider.otherwise({redirectTo: '/main'});
        //$locationProvider.html5Mode(true);
    });


YRoomsApp.controller("mainController", function mainController($scope,$http,$q, $interval,$location,$routeParams){
    //Функция для отображения текущего времени
    console.log("mainController Fired!");
    $scope.currentTime = new Date();
    console.log("currentTime: "+ $scope.currentTime);    
    
    $scope.currentTimeFormatted = ('0' + $scope.currentTime.getHours()).slice(-2)+':'+('0' + $scope.currentTime.getMinutes()).slice(-2);        
    // $interval(function(){        
    //     if($scope.currentTime.getSeconds()%2 ==0 )
    //         $scope.currentTimeFormatted = ('0' + $scope.currentTime.getHours()).slice(-2)+':'+('0' + $scope.currentTime.getMinutes()).slice(-2);
    //     else
    //         $scope.currentTimeFormatted = ('0' + $scope.currentTime.getHours()).slice(-2)+' '+('0' + $scope.currentTime.getMinutes()).slice(-2);
    // },1000);
    // $interval(function(){                
    //     $scope.currentTimeFormatted = ('0' + $scope.currentTime.getHours()).slice(-2)+':'+('0' + $scope.currentTime.getMinutes()).slice(-2);
    // },60000);

    console.log("param dateNow: " + $routeParams.DateNow);
    if($routeParams.DateNow == undefined)
    {
        $scope.currentDate = new Date();
        $scope.currentDate.setHours(0);
        $scope.currentDate.setMinutes(0);
        $scope.currentDate.setSeconds(0);
    }
        
    else
    {
        var year = $routeParams.DateNow.toString().substr(0,4);
        var month = parseInt($routeParams.DateNow.toString().substr(4,2))-1;
        var day = $routeParams.DateNow.toString().substr(6,2);        
        $scope.currentDate = new Date(year, month, day);
    }    
    console.log(((($scope.currentTime-$scope.currentDate)/60000)*65/60));
    processGrid($scope,$http);

    $scope.changedate = function(i)
    {
        if(i==-1)
        {            
            var prevDate = new Date((new Date($scope.currentDate)).setDate($scope.currentDate.getDate()-1));   
            console.log($scope.currentDate);
            console.log(prevDate);
            var dt = prevDate.getFullYear()*10000 +  (prevDate.getMonth()+1)*100 + prevDate.getDate();            
            console.log(dt);
        }
        else
        {
            var nextDate = new Date((new Date($scope.currentDate)).setDate($scope.currentDate.getDate()+1));   
            var dt = nextDate.getFullYear()*10000 +  (nextDate.getMonth()+1)*100 + nextDate.getDate();
        }
        $location.path('/main/'+dt);
        processGrid($scope,$http);
    }
    $scope.go = function(path){   
        $location.path(path);
    };
    $scope.getNextHour = function(){                
        var hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
        var dates = [];
        hours.forEach(function(hour,i,arr){
            var hourCell ={};
            hourCell.hrs = hour;            

            if($scope.currentTime > new Date(new Date($scope.currentDate).setHours(hour)))
            {
                hourCell.style="red"
            }
            else
            {
                hourCell.style="green"
            }
            dates.push(hourCell);
        })        
        return dates;
    }

    $scope.getNextHour = [];
    var hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    var dates = [];
    hours.forEach(function(hour,i,arr)
    {
        var hourCell ={};
        hourCell.hrs = hour;            

        if($scope.currentTime > new Date(new Date($scope.currentDate).setHours(hour)))
        {
            hourCell.style="#858E98";
        }
        else
        {
            hourCell.style="black";
        }
        $scope.getNextHour.push(hourCell);
    });
})

function processGrid($scope,$http){    
    $scope.monthName = months[$scope.currentDate.getMonth()];    
    $scope.startOfDay = $scope.currentDate;    
    $scope.endOfDay = new Date($scope.currentDate.getFullYear(),$scope.currentDate.getMonth(),$scope.currentDate.getDate(), 23,59,59,999);            
    
    var roompromise =  $http.get('/graphql?query=query{rooms{id, title,capacity,floor}}');// getrooms(`/graphql?query=query{rooms{id, title,capacity,floor}}`);
    
    roompromise.then(function(data){
        $scope.rooms = data.data.data.rooms;

        var eventpromise =  $http.get('/graphql?query=query{events{id, title, dateStart,dateEnd,users{login,avatarUrl},room{id,title}}}');// getrooms(`/graphql?query=query{rooms{id, title,capacity,floor}}`);
            
        eventpromise.then(function(data){                    
            $scope.events = data.data.data.events.filter(function(evnt){
                return ((Date.parse(evnt.dateStart) >= $scope.startOfDay) && (Date.parse(evnt.dateStart) <= $scope.endOfDay));
            });

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
                console.log(room.title + " events:");

                console.log(room.timeslots);
            });          
        })
    })
}

var months = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];




function compare(e1,e2)
{
    if(e1.dateStart>e2.dateStart)
        return 1;
    if(e1.dateStart<e2.dateStart)
        return -1;
    return 0;
}



function formatDate(dateString,formatString)
{
    var date = new Date(dateString);
    if(formatString == "HH:mm")
    {
        var hoursStr =  ('0' + date.getHours()).slice(-2);
        var minutesStr =  ('0' + date.getMinutes()).slice(-2);
        return hoursStr + ":" + minutesStr;
    }
    if(formatString == "dd.MM.yyyy")
    {
        return ('0' + date.getDate()).slice(-2) + "." + ('0' + (date.getMonth()+1)).slice(-2) + "." + date.getFullYear(); 
    }
    if(formatString == "dd MMMMM yyyy")
    {
        return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear(); 
    }   
}

YRoomsApp.controller("eventController", function eventController($scope, $http,$location,$routeParams) {    
        $scope.formData = {};
        $scope.eventData = {};

        console.log("eventController with params:");
        console.log($routeParams.date);
        if($routeParams.eventId == undefined)
        {            
            $scope.caption = "Новая встреча";
            
            $scope.eventData.eventDate = formatDate(new Date(), "dd.MM.yyyy");
            $scope.eventData.room = null;
        }
        else
        {
            $scope.caption = "Редактирование встречи";   
            
            var eventpromise =  $http.get('/graphql?query=query{event(id:'+$routeParams.eventId + 
                '){id, title, dateStart,dateEnd,users{login,avatarUrl,id},room{title,floor}}}');
    
            eventpromise.then(function(data){
                
                $scope.eventData = data.data.data.event;                
                $scope.initialUserIds = $scope.eventData.users.map(function(user){return user.id});//сохраним начальный идентификаторы участников на случай если оно изменится

                
                $scope.eventData.timeStart = formatDate($scope.eventData.dateStart,"HH:mm");                
                $scope.eventData.timeEnd =formatDate($scope.eventData.dateEnd,"HH:mm");
                $scope.eventData.eventDate = formatDate($scope.eventData.dateStart,"dd.MM.yyyy");
                
            })     
        }


        var userpromise = $http.get('/graphql?query=query{users{id,login,avatarUrl}}');

        userpromise.then(function(data){            
            $scope.users = data.data.data.users;
        })

        $http.get('/graphql?query=query{rooms{id,title, floor}}')
        .then(function(data){            
            $scope.rooms = data.data.data.rooms;
            
        });

        $scope.$watch($scope,function(){            
            new InputMask();            
        })


        $scope.go = function(path){   
            $location.path(path);
        };
        
        $scope.deleteUser = function(user)
        {
            $scope.eventData.users = $scope.eventData.users.filter(function(u)
            {
                return u.login != user.login;
            });
        }

        $scope.selectRoom = function(room)
        {
            $scope.eventData.room = room;
        }
        $scope.cancelRoom = function()
        {
            $scope.eventData.room = null;   
        }

        $scope.userSelected = function(){
            if($scope.eventData.users == undefined)
            {
                $scope.eventData.users=[];
            }
            if(!$scope.eventData.users.includes($scope.selectedUser))
            {
                $scope.eventData.users.push($scope.selectedUser);    
            }
            $scope.selectedUser = null;
        }

        $scope.deleteEvent = function(eventId){

            document.getElementById('deleteModal').style.display = "block";
        };
        $scope.confirmDeleting = function(eventId)
        {
            var querystr = '/graphql?query=mutation{removeEvent(id:'+eventId+'){id}}';
            $http.post(querystr).then(function(data){
                window.history.back();
            })            
        }

        $scope.saveChanges = function(){

            //Тут тихий ужас от форматирования даты
            var y = $scope.eventData.eventDate.substr(6,4);
            var m = $scope.eventData.eventDate.substr(3,2);
            var d = $scope.eventData.eventDate.substr(0,2);
            var date_string = y+"-"+m+"-"+d;
            //добавил поле ID в загрузке модели редактирования
            var newDateStart = new Date(date_string + 'T' + $scope.eventData.timeStart + ':00.000').toISOString();
            var newDateEnd = new Date(date_string + 'T'+ $scope.eventData.timeEnd + ':00.000').toISOString();
            if($routeParams.eventId == undefined)
            {
                currentUserIds = $scope.eventData.users.map(function(e){
                    return e.id
                });//TODO refactor

                var querystr = '/graphql?query=mutation{createEvent(input:{title:"' + $scope.eventData.title + '", dateStart:"'+ newDateStart +'",dateEnd:"' + newDateEnd + '"},usersIds:['+currentUserIds+'],roomId:'+$scope.eventData.room.id+'){id}}';     
                console.log(querystr);
                $http.post(querystr).then(function(data){
                    
                    window.history.back();
                    document.getElementById('saveModal').style.display = "block";
                });
            }
            else
            {
                var querystr = '/graphql?query=mutation{updateEvent(id:'+ $scope.eventData.id + ',input:{title:"' + $scope.eventData.title + '", dateStart:"'+ newDateStart +'",dateEnd:"' + newDateEnd + '"}){id}}';     
                console.log(querystr);
                $http.post(querystr).then(function(data){
                    currentUserIds = $scope.eventData.users.map(function(e){
                        return e.id
                    });//сохраним начальный идентификаторы участников на случай если оно изменится

                    var IDsToAdd = [];
                    var IDsToRemove = []

                    currentUserIds.forEach(function(item,i,arr){
                        if (!$scope.initialUserIds.includes(item))
                        {
                            querystr = '/graphql?query=mutation{addUserToEvent(id:'+$scope.eventData.id+', userId:'+item+'){id}}';
                            $http.post(querystr).then(function(data){
                                console.log(data);
                            }); 
                        }
                    })

                    $scope.initialUserIds.forEach(function(item,i,arr){
                        if (!currentUserIds.includes(item))
                        {
                            querystr = '/graphql?query=mutation{removeUserFromEvent(id:'+$scope.eventData.id+', userId:'+item+'){id}}';
                            $http.post(querystr).then(function(data){
                                console.log(data);
                            });
                        }
                    })                
                    window.history.back();
                    document.getElementById('saveModal').style.display = "block";
                })
            };            
        };
    }
)
