var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development'; //if first one has no value(when running from local), assign 'development'
var sequelize;

if (env === 'production'){
	sequelize = new Sequelize(process.env.DATABASE_URL, {'dialect':'postgres'} ); 
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
db.user = sequelize.import(__dirname + '/models/user.js');

db.sequelize = sequelize; //instance
db.Sequelize = Sequelize; //library


db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;