module.exports.index = function (req, res) {
  res.sendFile(__dirname + "/../public/main.html");
};

module.exports.createEvent = function (req, res) {
  res.sendFile(__dirname + "../public/newEvent.html");
};

module.exports.editEvent = function (req, res) {
  res.sendFile(__dirname + "../public/newEvent.html");
};

// app.get('/event/get:event_id', function(req, res) {
// 	var options ={
// 		host:"localhost",
// 		port: 3000,
// 		path:'/graphql?query={event(id:'+req.params.event_id+'){title,id,dateStart,dateEnd,room{title},users{login}}}',
// 		method: "GET"
// 	};
// 	http.get(options,function(res1)
// 	{
// 		res1.setEncoding("utf-8");
// 		res1.on("data",function(chunk)
// 			{
// 				var resObj = JSON.parse(chunk);
// 				res.json(resObj.data.event);
// 			})
// 	});
// });

// app.get('/event',function(r,s){
// 	s.sendFile(__dirname+'/public/main.html');
// })
