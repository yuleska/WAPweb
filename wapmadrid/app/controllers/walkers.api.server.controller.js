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


/**
 * Register Walker
 */
exports.register = function(req, res) {
    var query = Walker.findOne({ 'username': req.body.username });
    query.exec(function (err, duplicate) {
        if (duplicate){
            var ret = {};
            ret.error = 1;
            ret.error_message = "Nombre de wappy en uso";
            return res.status(200).jsonp(ret);  
        }
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
                	ret.error = err.code;
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
    });
};

/**
 * Login Walker
 */
exports.read = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var ret = {};
        ret.profileImage = walker.profileImage;
        ret.firstName = walker.firstName;
        ret.lastName = walker.lastName;
        ret.sex = walker.sex;
        ret.birthDate = walker.birthDate;
        ret.email = walker.email;
        ret.telephone = walker.telephone;
        ret.weight = walker.weight;
        ret.height = walker.height;
        ret.smoker = walker.smoker;
        ret.alcohol = walker.alcohol;
        ret.diet = walker.diet;
        ret.exercise = walker.exercise;
        ret.stats = walker.stats;
        ret.error = 0;
        return res.status(200).jsonp(ret); 
    });
};

/**
 * Login walker
 */
exports.login = function(req, res) {
    var query = Walker.findOne({ 'username': req.body.username });
    query.exec(function (err, walker) {
        if (walker && walker.authenticate(req.body.password)){
            var token = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    		token = crypto.pbkdf2Sync(token, token, 10000, 64).toString('base64');
            walker.token = token;
    		walker.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = 1;
                    ret.error_message = err;
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
            ret.error_message = "Usuario o password incorrecto";
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
        walker.firstName = req.body.firstName;
        walker.lastName = req.body.lastName;
        walker.birthDate = req.body.birthDate;
        walker.email = req.body.email;
        walker.sex = req.body.sex;
        walker.telephone = req.body.telephone;
        walker.profileImage = req.body.profileImage;
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
};

exports.uploadStats = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var stats = {};
        stats.distance = req.body.distance;
        stats.kcal = req.body.kcal;
        walker.stats.push(stats);
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
        var query = User.findById(walker.user);
        query.select('image displayName address telephone openingHours');
        query.exec(function(err, cms) { 
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
        var query = Walker.findById(req.params.id).populate('groups.groupID', 'image name');
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


exports.getFriends = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = Walker.findById(walker._id).populate('friends.friendID', 'profileImage displayName _id roles');
        query.exec(function (err, friends) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                ret.friends = friends.friends;
                return res.status(200).jsonp(ret);  
            }
        }); 
    }); 
};

exports.setFriends = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var friend = {};
        friend.friendID = req.body.friend;
        friend.state = 'pending';
        walker.friends.push(friend);
        var ret = {};
        walker.save(function(err) {
            if (err) {
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                ret.error = 0;
                Walker.findById(req.body.friend, function(err, walkerFriend) {
                    var friend = {};
                    friend.friendID = walker._id;
                    friend.state = 'request';
                    walkerFriend.friends.push(friend);
                    walkerFriend.save(); 
                });
                return res.status(200).jsonp(ret);  
            }
        });
    }); 
};

exports.responseFriendRequest = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        if (req.body.response == "true"){            
            var request  = walker.friends.id(req.body.id);
            if (!request){
                var ret = {};
                ret.error = 2;
                return res.status(200).jsonp(ret);  
            }
            walker.friends.id(req.body.id).state = "accepted";
            var ret = {};
            walker.save(function(err) {
                if (err) {
                    ret.error = 1;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    ret.error = 0;
                    Walker.findById(walker.friends.id(req.body.id).friendID, function(err, walkerFriend) {
                        var found = false;
                        var i;
                        for (i = 0 ; i < walkerFriend.friends.length && !found; i++){
                            var id = walkerFriend.friends[i].friendID;
                            if (id.equals(walker._id)){
                                walkerFriend.friends[i].state = "accepted";
                                walkerFriend.save();
                                found = true;
                            }
                        }
                    });
                    return res.status(200).jsonp(ret);  
                }
            });
        } else if (req.body.response == "false"){  
            var request  = walker.friends.id(req.body.id);
            if (!request){
                var ret = {};
                ret.error = 2;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } 
            walker.friends.id(req.body.id).remove();
            var ret = {};
            walker.save(function(err) {
                if (err) {
                    ret.error = 1;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    ret.error = 0;
                    Walker.findById(req.body.friendID, function(err, walkerFriend) {
                        var found = false;
                        var i;
                        for (i = 0 ; i < walkerFriend.friends.length && !found; i++){
                            var id = walkerFriend.friends[i].friendID;
                            if (id.equals(walker._id)){
                                walkerFriend.friends.id(walkerFriend.friends[i]._id).remove();
                                walkerFriend.save();
                                found = true;
                            }
                        }
                    });
                    return res.status(200).jsonp(ret);  
                }
            });
        }
    }); 
};

exports.deleteFriend = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
            var request  = walker.friends.id(req.body.id);
            if (!request){
                var ret = {};
                ret.error = 2;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            }
            walker.friends.id(req.body.id).remove();
            var ret = {};
            walker.save(function(err) {
                if (err) {
                    ret.error = 1;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    ret.error = 0;
                    Walker.findById(req.body.friendID, function(err, walkerFriend) {
                        var found = false;
                        var i;
                        for (i = 0 ; i < walkerFriend.friends.length && !found; i++){
                            var id = walkerFriend.friends[i].friendID;
                            if (id.equals(walker._id)){
                                walkerFriend.friends.id(walkerFriend.friends[i]._id).remove();
                                walkerFriend.save();
                                found = true;
                            }
                        }
                    });
                    return res.status(200).jsonp(ret);  
                }
            });
    }); 
};


