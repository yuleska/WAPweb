var mongoose = require('mongoose');
var User = mongoose.model('User');
var Walker = mongoose.model('Walker');

exports.checkCredentials = function (id,token, callback){
	Walker.findById(id, function(err, walker) {
		var ret = {};
		if(err) {
	    		ret.error = 1;
	    		ret.message_es = "El identificador de usuario introducido no es valido";
			return callback(ret,null);
		}

		if (walker == null){
			ret.error = 2;
		    	ret.message_es = "Ha ocurrido un error, por favor cierra sesion y vuelve a iniciar. Gracias";
			return callback(ret,null);
		}
		

		if (token != walker.token || walker.token == null){
			ret.error = 3;
			ret.message_es = "Ha ocurrido un error, por favor cierra sesion y vuelve a iniciar. Gracias";
			return callback(ret,null);
		}
		ret.error = 0;
		return callback(ret,walker);
	});

};

