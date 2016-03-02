var Sequelize = require('Sequelize');
var env = process.env.NODE_ENV || 'development'; //if first one has no value, assign 'development'
var sequelize;

if (env === 'production'){
	sequelize = new Sequelize(process.env.DATABASE_URL, {dialect:'postgres'} ); 
}else{
	sequelize = new Sequelize(undefined, undefined,undefined, {
		'dialect':'sqlite',
		'storage': __dirname + '/data/dev-todos-api.sqlite'
	});

}
// var sequelize = new Sequelize(undefined, undefined,undefined, {
// 	'dialect':'sqlite',
// 	'storage': __dirname + '/data/dev-todos-api.sqlite'
// });


var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js'); //import function pass 2 special hidden arguments to function in todo.js

db.sequelize = sequelize; //instance
db.Sequelize = Sequelize; //library

module.exports = db;