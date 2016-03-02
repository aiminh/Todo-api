var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', 
	function(req, res){
		res.send('Todo API root');
	}
);

//GET todos,  specify a route /todos
//search1: ?completed=true
//search2: ?q=abc, search descriptions that contains substring
app.get('/todos',
	function(req, res){
		var query = req.query;
		var where = {};

		if (query.hasOwnProperty('completed') && query.completed === 'true'){
			where.completed = true;
		}else if(query.hasOwnProperty('completed') && query.completed === 'false') {
			where.completed = false;
		}

		if(query.hasOwnProperty('q') && query.q.length > 0 ){
			where.description =  { $like: '%' + query.q + '%'};
		}

		db.todo.findAll(
			{where:where}
		).then(
		function(matchedTodos){
			if(!!matchedTodos){
				res.json(matchedTodos);
				matchedTodos.forEach(function(todo){
					console.log(todo.toJSON());
				});
			}else{
				console.log('no todo found!');
				res.status(404).send();
			}
		}
		).catch(
			function(e){
				res.status(500).send();
			}
		);

		// var queryParams = req.query;
		// var filteredTodos = todos;
		// console.log(queryParams);

		// //?completed=true or false
		//  if(queryParams.hasOwnProperty('completed')  && queryParams.completed === "true"){
		//  	filteredTodos = _.where(todos, {completed: true} );
		//  }else if (queryParams.hasOwnProperty('completed')  && queryParams.completed === "false"){
		//  	filteredTodos = _.where(todos, {completed: false} );
		//  }

		//  //?q=abc
		//  if( queryParams.hasOwnProperty('q') && queryParams.q.length > 0){

		//  	filteredTodos = _.filter(filteredTodos,  
		//  		function(obj){ 
		//  		 return obj.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;  

		//  		} 
		//  	);
		//  }
		// res.json(filteredTodos); //it will convert it to JSON and send back to whoever calls the api
	}
);





//Get todos/:id
app.get(
	'/todos/:id',
	function(req, res){
		var todoId = parseInt(req.params.id, 10); //convert the string to Int

		db.todo.findById(todoId).then( 
			function(matchedTodo){
				if(!!matchedTodo){
					res.json(matchedTodo);
				}else{
					console.log('no todo found!');
					res.status(404).send();
				}
			}, function(e){
				res.status(500).send();
		});

		// var matchedTodo = _.find(todos, {"id": todoId});
		// if (matchedTodo){
		// 	res.json(matchedTodo);
		// }else{
		// 	res.status(404).send();
		// }
	}
);

//POST /todos
app.post('/todos',
	function(req, res){
		//use _.pick() to pick only description and completed
		var body = _.pick(req.body, 'description','completed');


		if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
		 	return res.status(400).send(); //400 means request is invalid
		 }

		body.description = body.description.trim();
		//body.id = todoNextId;
		//todoNextId++;   //sqlite auto increment id from 1 by default?

		db.todo.create( body)
		.then(
			function(todo){
				console.log(todo.toJSON());
				res.json(todo.toJSON());
			}
		).catch(
			function(e){
				return res.status(400).json(e);
			}
		);


		///////
		// if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
		// 	return res.status(400).send(); //400 means request is invalid
		// }

		// body.description = body.description.trim();

		// //add id field
		// body.id = todoNextId;
		// todoNextId++;

		// todos.push(body);

		// //push to todo array
		// console.log('description: ' + req.body.description);
		// res.json(body);
	}
);

app.delete('/todos/:id',
	function(req, res){
		var todoId = parseInt(req.params.id, 10); //convert the string to Int
		var matchedTodo = _.find(todos, {"id": todoId});

		if (matchedTodo){
			todos = _.without( todos, matchedTodo );
			res.json(matchedTodo);
		}else{
			return res.status(404).json({"error":"no todo found with that id"});
		}
	}
);

app.put('/todos/:id', 

	function(req, res){
		var todoId = parseInt(req.params.id, 10); //convert the string to Int
		var matchedTodo = _.find(todos, {"id": todoId}); //passed by reference, so if matchedTodo changed, the corresponding element in array also changes
		var body = _.pick(req.body, 'description','completed');
		var validateAttributes = {};

		if (!matchedTodo){
			return res.status(404).send();
		}

		if(body.hasOwnProperty('completed') && _.isBoolean(body.completed) ){
			validateAttributes.completed = body.completed;

		}else if(body.hasOwnProperty('completed')) {
			return res.status(400).send();
		}

		if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0  ){
			validateAttributes.description = body.description;
		}else if (body.hasOwnProperty('description')){
			return res.status(400).send();
		}

		//HERE
		// extend_.extend(destination, *sources) 
		// Copy all of the properties in the source objects over to the destination object, and return the destination object. It's in-order, so the last source will override properties of the same name in previous arguments.

		// _.extend({name: 'moe'}, {age: 50});
		// => {name: 'moe', age: 50}

		_.extend(matchedTodo, validateAttributes);

		res.json(matchedTodo).send();


	}
);

db.sequelize.sync().then(function(){
	app.listen(
		PORT, 
		function(){
			console.log('express listening on port ' + PORT);
		} 
	);
});


