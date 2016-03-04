var bcrypt = require('bcrypt');
var _ = require('underscore');


module.exports = function(sequelize, DataTypes){
	var user = sequelize.define('user', {
		email:{
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail:true
			}
		},
		salt:{
			type:DataTypes.STRING
		},
		password_hash:{
			type:DataTypes.STRING
		},
		password:{
			type:DataTypes.VIRTUAL,
			allowNull:false,
			validate:{
				len:[7,100]
			},
			set: function(value){
				var salt = bycrypt.genSaltSync(10);
				var hashedPassword = bycrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}	
	},{
		hooks:{
			beforeValidate: function(user, options){
				if(typeof user.email === 'string'){
					user.email = user.email.toLowerCase();
				}
			}
		},
		instanceMethods: 
		{
			toPublicJSON: function(){
				var json = this.toJSON();
				return _.pick(json, 'id','email','createdAt', 'updatedAt');
			}
		},
		classMethods:
		{
			authenticate: function(body){
				return new Promise( function(resolve, reject){

					if(typeof body.email !== 'string' || typeof body.password !== 'string'){
						return reject();
					}

					var where = {email:body.email};
				
					user.findOne({where:where}).then(
						function(matchedUser){
							if (!matchedUser || !bcrypt.compareSync(body.password, matchedUser.get('password_hash'))){
								return reject();
							}	
							return resolve(matchedUser);	
						},
						function(e){
							reject();
						}
					);
				});
			}
		}
	});
	return user;
};





