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
    Group = mongoose.model('Group'),
    Route = mongoose.model('Route'),
    utils = require('./utils.js');


/**
 * Register Walker
 */
exports.create = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var group = new Group(req.body);
        var members = {};
        group.captain = walker._id;
        members.idMember  = walker._id;
        members.accepted = true;
        group.members.push(members);
        group.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = 4;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    var group = {};
                    group.groupID = group._id;
                    group.roles = "captain";
                    walker.groups.push(group);
                    walker.save(function(err) {
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
};

/**
 * Login Walker
 */
exports.join = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
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
                members.idMember  = walker._id;
                members.accepted = false;
                group.members.push(members);
                group.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = 5;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    var group = {};
                    group.groupID = group._id;
                    group.roles = "user";
                    walker.groups.push(group);
                    walker.save(function(err) {
                        if (err) {
                            var ret = {};
                            ret.error = 6;
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
            }
        });
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
        weight.firstName = req.body.firstName;
        weight.lastName = req.body.lastName;
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

exports.deleteGroup = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var request  = walker.groups.id(req.body.id);
        if (!request){
            var ret = {};
            ret.error = 2;
            ret.error_message = err;
            return res.status(200).jsonp(ret);  
        } 
        walker.groups.id(req.body.id).remove();
        walker.save(function(err) {
            if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                // Delete walker from group
                var ret = {};
                ret.error = 0;
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
        group.roles = req.body.roles;
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

exports.getFriends = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = Walker.findById(walker._id).populate('friends.friendID', 'profileImage displayName _id roles.type');
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




alreadyMember = function (members, id){

    var i = 0;
    var alreadyMember = false;
    while (i < members.length && !alreadyMember){
        if (members[i].idMember.equals(id))
            alreadyMember = true;
        i++;
    }
    return alreadyParticipant;
}