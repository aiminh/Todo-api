var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');


var app = express();
var PORT = process.env.PORT || 3000;

var todos = [
	// {
	// 	id:1,
	// 	description:'task1',
	// 	complete:true
	// },
	// {
	// 	id:2,
	// 	description:'task2',
	// 	complete:false
	// },
	// {
	// 	id:3,
	// 	description:'task3',
	// 	complete:true
	// }
];

var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', 
	function(req, res){
		res.send('Todo API root');
	}
);

//GET todos,  specify a route /todos
app.get('/todos',
	function(req, res){
		res.json(todos); //it will convert it to JSON and send back to whoever calls the api
	}
);

//Get todos/:id
app.get(
	'/todos/:id',
	function(req, res){
		
		var todoId = parseInt(req.params.id, 10); //convert the string to Int
		var matchedTodo = _.find(todos, {"id": todoId});


		//iterate fo todos array, find the match
		// todos.forEach(
		// 	function(todo){
		// 		if (todo.id === todoId) {
		// 			matchedTodo = todo;
		// 		}
		// 	}
		// );

		if (matchedTodo){
			res.json(matchedTodo);
		}else{
			res.status(404).send();
		}


	}
);

//POST /todos
app.post('/todos',
	function(req, res){
		//use _.pick() to pick only description and completed

		var body = _.pick(req.body, 'description','completed');

		if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
			return res.status(404).send();
		}

		body.description = body.description.trim();

		//add id field
		body.id = todoNextId;
		todoNextId++;

		todos.push(body);

		//push to todo array
		console.log('description: ' + req.body.description);
		res.json(body);
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

app.listen(
	PORT, 
	function(){
		console.log('express listening on port ' + PORT);
	} 
);
