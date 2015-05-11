'use strict';

/**
 * Module dependencies.
 */

 var _ = require('lodash'),
    //errorHandler = require('errors.server.controller.js'),
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    Walker = mongoose.model('Walker'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    Route = mongoose.model('Route'),
    utils = require('./utils.js');


exports.register = function(req, res) {
    var query = User.findOne({ 'username': req.body.username });
    query.exec(function (err, duplicate) {
        if (duplicate){
            var ret = {};
            ret.error = 1;
            ret.error_message = "Nombre de centro en uso";
            return res.status(200).jsonp(ret);  
        }
    	var user = new User(req.body);	
        var token = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        token = crypto.pbkdf2Sync(token, token, 10000, 64).toString('base64');
        var password = req.body.password;
        if (password && password.length > 6) {
            var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
            salt = crypto.pbkdf2Sync(salt, salt, 10000, 64).toString('base64');
            user.password = user.hashPassword(password,salt);
            user.salt = salt;
            user.token = token;
            user.displayName = req.body.firstName + " " + req.body.lastName;
        	user.save(function(err) {
                if (err) {
                    var ret = {};
                	ret.error = err.code;
                	ret.error_message = err;
                    return res.status(200).jsonp(ret);	
                } else {
                	var ret = {};
                    ret.token = user.token;
                    ret._id = user._id;
                	ret.error = 0;
                    return res.status(200).jsonp(ret);	
                }
            });
        } else {
            var ret = {};
            ret.error = 2;
            ret.error_message = "Password demasiado corta";
            return res.status(200).jsonp(ret);  
        }
    });
};

/**
 * Login User
 */
exports.read = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var ret = {};
        ret.image = user.image;
        ret.name = user.name;
        ret.username = user.username;
        ret.address = user.address;
        ret.telephone = user.telephone;
        ret.openingHours = user.openingHours;
        ret.telephone = user.telephone;
        ret.error = 0;
        return res.status(200).jsonp(ret); 
    });
};

/**
 * Login walker
 */
exports.login = function(req, res) {
    var query = User.findOne({ 'username': req.body.username });
    query.exec(function (err, user) {
        if (user && user.authenticate(req.body.password)){
            var token = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    		token = crypto.pbkdf2Sync(token, token, 10000, 64).toString('base64');
            user.token = token;
    		user.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = 1;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    var ret = {};
                    ret.token = token;
                    ret._id = user._id;
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