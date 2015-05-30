'use strict';

/**
 * Module dependencies.
 */

 var _ = require('lodash'),
    //errorHandler = require('errors.server.controller.js'),
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    User = mongoose.model('User'),
    Route = mongoose.model('Route'),
    Admin = mongoose.model('Admin'),
    utils = require('./utils.js');


exports.registerCms = function(req, res) {
    utils.checkCredentialsAdmin(req.params.id,req.body.token,function (checkCredentials,admin){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = User.findOne({ 'username': req.body.username });
        query.exec(function (err, duplicate) {
            if (duplicate){
                var ret = {};
                ret.error = 4;
                ret.error_message = "Nombre de centro en uso";
                return res.status(200).jsonp(ret);  
            }
        });
    	var user = new User(req.body);	
        var password = req.body.password;
        if (password && password.length > 6) {
            var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
            salt = crypto.pbkdf2Sync(salt, salt, 10000, 64).toString('base64');
            user.password = user.hashPassword(password,salt);
            user.salt = salt;
        	user.save(function(err) {
                if (err) {
                    var ret = {};
                	ret.error = err.code;
                	ret.error_message = err;
                    return res.status(200).jsonp(ret);	
                } else {
                	var ret = {};
                	ret.error = 0;
                    return res.status(200).jsonp(ret);	
                }
            });
        } else {
            var ret = {};
            ret.error = 5;
            ret.error_message = "Password demasiado corta";
            return res.status(200).jsonp(ret);  
        }
    });
};

exports.updateCms = function(req, res) {
    utils.checkCredentialsAdmin(req.params.id,req.body.token,function (checkCredentials,admin){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = User.findById(req.body.userID);
        query.exec(function (err, user) {
			if (user == null){
				var ret = {};
				ret.error = 6;
				ret.error_message = "Id de CMS no existe";
				return res.status(200).jsonp(ret);  
			}
            var queryDuplicate = User.findOne({ 'username': req.body.username });
            queryDuplicate.exec(function (err, duplicate) {
                if (duplicate && !duplicate._id.equals(user._id)){
                    var ret = {};
                    ret.error = 4;
                    ret.error_message = "Nombre de centro en uso";
                    return res.status(200).jsonp(ret);  
                }				
                user.name = req.body.name;
                user.image = req.body.image;
                user.username = req.body.username;
                user.address = req.body.address;
                user.telephone = req.body.telephone;
                user.openingHours = req.body.openingHours;
                user.route = req.body.route;
				var password = req.body.password;
                if (password && !password.equals("")){
                    if (password.length > 6) {
                        var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
                        salt = crypto.pbkdf2Sync(salt, salt, 10000, 64).toString('base64');
                        user.password = user.hashPassword(password,salt);
                        user.salt = salt;
                    } else {
                        var ret = {};
                        ret.error = 5;
                        ret.error_message = "Password demasiado corta";
                        return res.status(200).jsonp(ret);  
                    }

                }
                user.save(function(err) {
                    if (err) {
                        var ret = {};
                        ret.error = err.code;
                        ret.error_message = err;
                        return res.status(200).jsonp(ret);  
                    } else {
                        var ret = {};
                        ret.error = 0;
                        return res.status(200).jsonp(ret);  
                    }
                });
            });
        });
    });
};

exports.readCms = function(req, res) {
    utils.checkCredentialsAdmin(req.params.id,req.body.token,function (checkCredentials,admin){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = User.findById(req.body.userID).populate('route');
        query.select('name image username address telephone email openingHours route');
        query.exec(function (err, user) {
              if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                ret.user = user;
                return res.status(200).jsonp(ret); 
            } 
        });
    });
};

exports.readAllCms = function(req, res) {
    utils.checkCredentialsAdmin(req.params.id,req.body.token,function (checkCredentials,admin){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = User.find().populate('route');
        query.select('_id name image username address telephone openingHours route');
        query.exec(function (err, user) {
              if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                ret.user = user;
                return res.status(200).jsonp(ret); 
            } 
        });
    });
};

exports.login = function(req, res) {
    var query = Admin.findOne({ 'username': req.body.username });
    query.exec(function (err, admin) {
        if (admin && admin.authenticate(req.body.password)){
            var token = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
            token = crypto.pbkdf2Sync(token, token, 10000, 64).toString('base64');
            admin.token = token;
            admin.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = 4;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    var ret = {};
                    ret.token = token;
                    ret._id = admin._id;
                    ret.error = 0;
                    return res.status(200).jsonp(ret);  
                }
            });
        } else {
            var ret = {};
            ret.error = 2;
            ret.error_message = "Usuario o password incorrecto";
            return res.status(200).jsonp(ret); 
        }
    });
};

exports.logout = function(req, res) {
    utils.checkCredentialsAdmin(req.params.id,req.body.token,function (checkCredentials,admin){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        admin.token = null;
        admin.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });
    });
}

exports.updatePassword = function(req, res) {
    utils.checkCredentialsAdmin(req.params.id,req.body.token,function (checkCredentials,admin){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        salt = crypto.pbkdf2Sync(salt, salt, 10000, 64).toString('base64');
        admin.password = admin.hashPassword(req.body.password,salt);
        admin.salt = salt;
        admin.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });
    });
}

exports.registerAdmin = function(req, res) {
    var admin = new Admin(req.body);
    var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    salt = crypto.pbkdf2Sync(salt, salt, 10000, 64).toString('base64');
    admin.password = admin.hashPassword(req.body.password,salt);
    admin.salt = salt;
    admin.save(function(err) {
        if (err) {
            var ret = {};
            ret.error = 4;
            ret.error_message = err;
            return res.status(200).jsonp(ret);  
        } else {
            var ret = {};
            ret.error = 0;
            return res.status(200).jsonp(ret);  
        }
    });
}
