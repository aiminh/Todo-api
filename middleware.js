module.exports = function(db){

	return {
		requireAuthentication: function(req, res, next){
			var token = req.get('Auth');  //we put 'Auth' header manually in postman, so 'Auth'  is in req
			db.user.findByToken(token).then(
				function(user){
					req.user = user; //put the found user into req
					next();
				},
				function(){
					res.status(401).send();
				}

			);
		}
	};
}