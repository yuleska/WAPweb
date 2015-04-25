'use strict';

/**
 * Module dependencies.
 */

 var _ = require('lodash'),
 	//errorHandler = require('errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    crypto = require('crypto'),
    Walker = mongoose.model('Walker'),
    User = mongoose.model('User'),
    utils = require('./utils.js');


/**
 * Register Walker
 */
exports.register = function(req, res) {
    var query = Walker.findOne({ 'username': req.body.username });
	var walker = new Walker(req.body);	
    var token = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    token = crypto.pbkdf2Sync(token, token, 10000, 64).toString('base64');
    var password = req.body.password;
    if (password && password.length > 6) {
        var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        salt = crypto.pbkdf2Sync(salt, salt, 10000, 64).toString('base64');
        walker.password = walker.hashPassword(password,salt);
        walker.salt = salt;
        walker.token = token;
        walker.displayName = req.body.firstName + " " + req.body.lastName;
    	walker.save(function(err) {
            if (err) {
                var ret = {};
            	ret.error = 1;
            	ret.error_message = err;
                return res.status(200).jsonp(ret);	
            } else {
            	var ret = {};
                ret.token = walker.token;
                ret._id = walker._id;
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
};

/**
 * Login Walker
 */
exports.read = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);

    });
};

/**
 * Login walker
 */
exports.login = function(req, res) {
    var query = Walker.findOne({ 'username': req.body.username });
    query.exec(function (err, walker) {
        if (walker.authenticate(req.body.password)){
            var token = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    		token = crypto.pbkdf2Sync(token, token, 10000, 64).toString('base64');
            walker.token = token;
    		walker.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = 1;
                    ret.err = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    var ret = {};
                    ret.token = token;
                    ret._id = walker._id;
                    ret.error = 0;
                    return res.status(200).jsonp(ret);  
                }
            });
        } else {
            var ret = {};
            ret.error = 2;
            ret.msg = walker.password;
            ret.msg2 = walker.hashPassword(req.body.password, walker.salt);
            return res.status(200).jsonp(ret); 
        }
    });
};

exports.logout = function(req, res){
	utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
		if (checkCredentials.error != "0")
			return res.status(200).jsonp(checkCredentials);
		walker.token = null;
        walker.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });
	});
};

exports.updateInfo = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        weight.firstName = req.body.firstName;
        weight.lastName = req.body.lastName;
        walker.birthDate = req.body.birthDate;
        walker.email = req.body.email;
        walker.sex = req.body.sex;
        walker.telephone = req.body.telephone;
        walker.displayName = req.body.firstName + " " + req.body.lastName;
        walker.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });

    });
};

exports.updatePassword = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        if (walker.authenticate(req.body.oldPassword)){
            var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
            salt = crypto.pbkdf2Sync(salt, salt, 10000, 64).toString('base64');
            walker.password = walker.hashPassword(password,salt);
            walker.salt = salt;
            walker.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = 1;
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
            ret.error = 1;
            ret.error_message = "La password antigua no es correcta";
            return res.status(200).jsonp(ret);  
        }
    });
};

/**
 * Update a Walkerswalkersapicontroller
 */
exports.updateStatus = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var weight = {};
        weight.value = req.body.weight;
        weight.imc = req.body.weight / (req.body.height * req.body.height);
        walker.weight.push(weight);
        walker.height = req.body.height;
        walker.smoker = req.body.smoker;
        walker.alcohol = req.body.smoker;
        walker.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });

    });
};


exports.updateDiet = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var diet = {};
        diet.value = req.body.diet;
        walker.diet.push(diet);
        walker.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });

    });
};

exports.updateExercise = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var exercise = {};
        exercise.value = req.body.diet;
        walker.exercise.push(exercise);
        walker.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });

    });
};

/**
 * List of walkers
 */
exports.list = function(req, res) {
    Walker.find().sort('-created').populate('user', 'displayName').exec(function(err, walkers) {
        if (err) {
                var ret = {};
            	ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);	
            } else {
            	var ret = {};
            	ret.error = 0;
            	ret.walkers = walkers;
                return res.status(200).jsonp(ret);	
            }
    });
};

/**
 * Delete an Walkerswalkersapicontroller
 */
exports.getCms = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        User.findById(walker.user, function(err, cms) { 
            var ret = {};
            if(err) {
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);
            }
            ret.error = 0;
            ret.cms = cms;
            return res.status(200).jsonp(ret);
        });
    });
};

exports.setCms = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        walker.user = req.body.cms;
        walker.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });
    });     
};

exports.getGroups = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = Walker.findById(walker._id).populate('groups.groupsID');
        query.exec(function (err, groups) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                ret.groups = groups.groups;
                return res.status(200).jsonp(ret);  
            }
        }); 
    }); 
};

exports.setGroup = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var group = {};
        group.groupID = req.body.group;
        walker.groups.push(group);
        walker.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });
    }); 
};
