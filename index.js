const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

//const pagesRoutes = require('./pages/routes');
const graphqlRoutes = require('./graphql/routes');


const app = express();

app.use(bodyParser.json());
//app.use('/', pagesRoutes)
app.use('/graphql', graphqlRoutes);
app.use(express.static(path.join(__dirname, 'public')));


app.set("view engine","hbs");	



 
 app.get('/',function(r,s){
 	s.sendFile(__dirname+'/public/index.html');
 })

 app.get('/getDetails',function(req,res){
 	res.sendFile(__dirname+'/public/newEvent.html');
 	console.log('send');
 })

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
// 	s.sendFile(__dirname+'/public/newEvent.html');
// })

app.listen(3000, () => console.log('Express app listening on localhost:3000'));
