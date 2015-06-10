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
    Event = mongoose.model('Event'),
    utils = require('./utils.js');


exports.register = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        if (!(user.roles.equals("admin"))){
            var ret = {};
            ret.error = 5;
            ret.error_message = "No tienes permiso para crear un CMS";
            return res.status(200).jsonp(ret);  
        }
    });
    var query = User.findOne({ 'username': req.body.username });
    query.exec(function (err, duplicate) {
        if (duplicate){
            var ret = {};
            ret.error = 1;
            ret.error_message = "Nombre de centro en uso";
            return res.status(200).jsonp(ret);  
        }
    });
    	var user = new User(req.body);	
        user.roles = 'user';
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
    
};

/**
 * Login User
 */
exports.read = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user_in){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
		var query = User.findById(req.params.id).populate('route', 'name _id');
		query.exec(function (err, user) {
			var ret = {};
			ret.image = user.image;
			ret.name = user.name;
			ret.username = user.username;
			ret.address = user.address;
			ret.telephone = user.telephone;
			ret.openingHours = user.openingHours;
			ret.telephone = user.telephone;
			ret.email = user.email;
			ret.route = user.route;
			ret.error = 0;
			return res.status(200).jsonp(ret); 
		}); 
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
                    ret.roles = user.roles;
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

exports.registerWalker = function(req,res){
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = Walker.findOne({ 'username': req.body.username });
        query.exec(function (err, duplicate) {
            if (duplicate){
                var ret = {};
                ret.error = 4;
                ret.error_message = "Nombre de wappy en uso";
                return res.status(200).jsonp(ret);  
            }
            delete req.body.token;
            var weight = {};
            weight.value = req.body.weight;
            weight.imc = req.body.weight / (req.body.height * req.body.height);            
            delete req.body.weight;
            var walker = new Walker(req.body);  
            walker.weight.push(weight);
            var password = req.body.password;
            if (password && password.length > 6) {
                var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
                salt = crypto.pbkdf2Sync(salt, salt, 10000, 64).toString('base64');
                walker.password = walker.hashPassword(password,salt);
                walker.salt = salt;
                walker.displayName = req.body.firstName + " " + req.body.lastName;
                walker.user = user._id;
                walker.save(function(err) {
                    if (err) {
                        var ret = {};
                        ret.error = err.code;
                        ret.error_message = err;
                        return res.status(200).jsonp(ret);  
                    } else {
                        var newWalker = {};
                        newWalker.walkerID = walker._id;
                        user.walkers.push(newWalker);
                        user.save();
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
    });
}

exports.listWalkers = function(req,res){
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = User.findById(req.params.id).populate('walkers.walkerID', '_id profileImage displayName');
        query.exec(function (err, walkers) {
            if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                ret.walkers = walkers.walkers;
                return res.status(200).jsonp(ret);  
            }
        }); 
    });
}

exports.logout = function(req, res){
     utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        user.token = null;
        user.save(function(err) {
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

exports.updateInfoWalker = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Walker.findById(req.body.walkerID, function(err, walker){
            walker.firstName = req.body.firstName;
            walker.lastName = req.body.lastName;
            walker.birthDate = req.body.birthDate;
            walker.email = req.body.email;
            walker.address = req.body.address;
            walker.sex = req.body.sex;
            walker.city = req.body.city;
            walker.about = req.body.about;
            walker.telephone = req.body.telephone;
            walker.profileImage = req.body.profileImage;
            walker.displayName = req.body.firstName + " " + req.body.lastName;
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
    });
};

exports.updatePasswordWalker = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        Walker.findById(req.body.walkerID, function(err, walker){       
        var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        salt = crypto.pbkdf2Sync(salt, salt, 10000, 64).toString('base64');
        walker.password = walker.hashPassword(req.body.password,salt);
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
        });
    });
}

/**
 * Update a Walkerswalkersapicontroller
 */
exports.updateStatusWalker = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        Walker.findById(req.body.walkerID, function(err, walker){       
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
    });
}


exports.updateDietWalker = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        Walker.findById(req.body.walkerID, function(err, walker){ 
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
    });
}

exports.updateExerciseWalker = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        Walker.findById(req.body.walkerID, function(err, walker){
            var exercise = {};
            exercise.value = req.body.exercise;
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
    });
}

exports.readWalker = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
    
        var query = Walker.findById(req.body.walkerID);
        query.select('username profileImage firstName lastName sex birthDate email telephone address city about weight height smoker alcohol exercise stats diet');
        query.exec(function(err,search){
             if (err) {
                var ret = {};
                ret.error = err.code;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.walker = search;
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });
    });
}

exports.home = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        var ret = {};
        ret.name = user.name;
        ret.walkersCount = user.walkers.length;
        ret.groupsCount = user.groups.length;
        var query = Route.findById(user.route);
        query.select('name');
        query.exec(function(err,route){
            ret.route = route;
            Route.count(function(err,routesCount){
                ret.routesCount = routesCount;
                var queryEvents = Event.find().populate('owner, name');
                queryEvents.select('name text date owner');
                queryEvents.sort('-created');
                queryEvents.exec(function(err,events){
                    ret.events = events;
                    ret.error = 0;
                    return res.status(200).jsonp(ret); 
                });
            });
        });
    });
}

exports.groupsByRoute = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        var query = Groups.find();
        query.where('route').equals(req.body.routeID);
        query.select('_id name level schedule');
        query.exec(function (err, groups) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                ret.groups = groups;
                return res.status(200).jsonp(ret);                  
            }
        }); 
        
    });
}

exports.listGroups = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
    //    Group.populate(user, {path: 'groups.groupsID', select: 'image name _id'}, function (err, groups) {
        var query = User.findById(req.params.id).populate('groups.groupsID', 'image name schedule level _id');
        query.exec(function(err,groups){       
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
}

exports.createGroup = function(req, res) {
     utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        var group = new Group(req.body);
        var members = {};
        group.captain = req.body.captain;
        members.idMember  = req.body.captain;
        members.accepted = true;
        group.members.push(members);
        group.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {                    
                var ret = {};
                ret.error = 0;
                var groups = {};
                groups.groupsID = group._id;
                user.groups.push(groups);
                user.save();
                return res.status(200).jsonp(ret);  
            }
        });
    });
}

exports.getGroup = function(req, res) {
   utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        var query = Group.findById(req.body.groupID).populate('captain', 'profileImage displayName telephone email stats messages _id').populate('route', 'name _id');
        query.exec( function(err, group) {
            if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};               
                ret.error = 0;
                ret.group = group;
                return res.status(200).jsonp(ret);  
            }
        });
    });
}

exports.setGroupWalker = function(req, res) {
   utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials); 
        Group.findById(req.body.groupID, function(err, group) {
            if (alreadyMember(group.members,req.params.id)){
                var ret = {};
                ret.error = 4;
                ret.error_message = "Ya es miembro de este grupo";
                return res.status(200).jsonp(ret);  
            } else {
                var members = {};
                members.idMember  = req.body.walkerID;
                members.accepted = true;
                group.members.push(members);
                group.save(function(err) {
                    if (err) {
                        var ret = {};
                        ret.error = 5;
                        ret.error_message = err;
                        return res.status(200).jsonp(ret);  
                    } else {
                        var ret = {};
                        ret.error = 0;
                        return res.status(200).jsonp(ret);  
                    }
                });
            }
        });
    });
}