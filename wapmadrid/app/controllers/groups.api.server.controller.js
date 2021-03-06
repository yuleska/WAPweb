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
    fs = require('fs'),
    utils = require('./utils.js');


var SERVER_PATH = '/var/www/vhosts/madridsalud.es/wapmadrid.madridsalud.es/images/profiles/';
var SERVER_URL = 'http://wapmadrid.madridsalud.es/images/profiles/';

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
        var imageName = group._id + ".jpg";
        group.image = SERVER_URL + imageName;
        base64_decode(req.body.profileImage, SERVER_PATH + imageName); 
        group.save(function(err) {
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

/**
 * Register Walker
 */
exports.update = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = Group.findById(req.body.groupID);
        query.exec( function(err, group) {
            if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                if (req.body.profileImage){
                    var imageName = group._id + ".jpg";
                    group.image = SERVER_URL + imageName;
                    base64_decode(req.body.profileImage, SERVER_PATH + imageName); 
                }
                group.name = req.body.name;
                group.schedule = req.body.schedule;
                group.level = req.body.level;
                group.route = req.body.route;
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

function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    
}

exports.getGroup = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = Group.findById(req.body.groupID).populate('captain', 'profileImage displayName email stats _id').populate('route', 'name _id coordinates distance');
       query.exec( function(err, group) {
            if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.member = alreadyMember(group.members,req.params.id);                
                ret.error = 0;
                ret.group = group;
                delete ret.group.messages;
                delete ret.group.members;
                return res.status(200).jsonp(ret);  
            }
        });
    });
}

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

exports.responseJoinRequest = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Group.findById(req.body.groupID, function(err, group) {
            if (!walker._id.equals(group.captain)){
                var ret = {};
                ret.error = 4;
                ret.error_message = "No tienes permiso para esta operacion";
                return res.status(200).jsonp(ret);  
            }
            var request  = group.members.id(req.body.id);
            if (!request){
                ret.error = 5;
                ret.error_message = "Miembro no encontrado";
                return res.status(200).jsonp(ret);  
            }
            group.members.id(req.body.id).accepted = true;
            group.save(function(err) {
                    if (err) {
                        var ret = {};
                        ret.error = 7;
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

exports.expulseFromGroup = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Group.findById(req.body.groupID, function(err, group) {
            if (!walker._id.equals(group.captain)){
                var ret = {};
                ret.error = 4;
                ret.error_message = "No tienes permiso para esta operacion";
                return res.status(200).jsonp(ret);  
            }
            var request  = group.members.id(req.body.id);
            if (!request){
                ret.error = 5;
                ret.error_message = "Miembro no encontrado";
                return res.status(200).jsonp(ret);  
            }
            group.members.id(req.body.id).remove();
            group.save(function(err) {
	            if (err) {
	                var ret = {};
	                ret.error = 7;
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

exports.leaveGroup = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Group.findById(walker.groups.id(req.body.id).groupID, function(err, group) {
             if (walker._id.equals(group.captain)){
                var ret = {};
                ret.error = 4;
                ret.error_message = "Cede la capitania antes de salir del grupo";
                return res.status(200).jsonp(ret);  
            }
            var found = false;
            var i;
            var member = null;
            for (i = 0 ; i < group.members.length && !found; i++){
                var id =  group.members[i].idMember;
                if (id.equals(walker._id)){
                    member = group.members[i];
                    found = true;
                }
            }
            if (found){  
                group.members.id(member._id).remove();
            } else if (!found){
                var ret = {};
                ret.error = 6;
                ret.error_message = "El usuario no pertenece al grupo";
                return res.status(200).jsonp(ret);  
            }
            group.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = 7;
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

exports.listMembers = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = Group.findById(req.body.groupID).populate('members.idMember', 'profileImage displayName _id');
        query.exec(function (err, members) {
            if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                ret.members = members.members;
                return res.status(200).jsonp(ret);  
            }
        });
    }); 
}

exports.getMessages = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = Group.findById(req.body.groupID).populate('messages.idSender', 'profileImage displayName _id').sort('-messages.date');
        query.exec(function (err, messages) {
            if (err) {
                var ret = {};
                ret.error = 4;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                ret.messages = messages.messages;
                return res.status(200).jsonp(ret);  
            }
        });
    }); 
}

exports.sendMessage = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var message = {};
        message.text = req.body.text;
        message.idSender = req.params.id;
        Group.findById(req.body.groupID, function(err,group){
            group.messages.push(message);
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
        });
    }); 
}

exports.changeCaptain = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        
        Group.findById(req.body.groupID, function(err, group) {
            if (!group.captain.equals(walker._id)){
                var ret = {};
                ret.error = 4;
                ret.error_message = "No eres el capitan del grupo";
                return res.status(200).jsonp(ret);  
            }
            group.captain = req.body.newCaptainID;
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
        });
    }); 
}

exports.deleteGroup = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Group.findById(req.body.groupID, function(err, group) {
            if (!group.captain.equals(walker._id)){
                var ret = {};
                ret.error = 4;
                ret.error_message = "No eres el capitan del grupo";
                return res.status(200).jsonp(ret);  
            }
            group.remove();
            var ret = {};
            ret.error = 0;
            return res.status(200).jsonp(ret);  
        });
    }); 
}

exports.sendStats = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Group.findById(req.body.groupID, function(err, group) {
            if (!group.captain.equals(walker._id)){
                var ret = {};
                ret.error = 4;
                ret.error_message = "No eres el capitan del grupo";
                return res.status(200).jsonp(ret);  
            }
            var distance = req.body.distance;  
            var membersJSON = JSON.parse(req.body.members);
            var timeSpent = req.body.timeSpent;

            var nMembers = membersJSON.members.length;
            var stats = {};
            stats.distance = distance * nMembers;
            console.log("****STATS****");
            console.log(stats);
            group.stats.push(stats);
            console.log("****GROUP-STATS****");
            console.log(group.stats);
            group.save();
            var i = 0;
            for (i = 0; i < nMembers; i++) {
                var query = Walker.findById(membersJSON.members[i].id);
                query.exec(function (err,walker){
                    var peso = walker.weight[walker.weight.length-1].value;
                    var kcal = (2/3) * peso * distance;
                    var stats = {};
                    stats.distance = distance;
                    stats.kcal = kcal;
                    walker.stats.push(stats);
                    walker.save();
                });
            }  
        var ret = {};
        ret.error = 0;
        return res.status(200).jsonp(ret);              
        });
    }); 
}

exports.getStats = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Group.findById(req.body.groupID, function(err, group) {
            var ret = {};
            ret.error = 0;
            ret.stats = group.stats;
            return res.status(200).jsonp(ret);    
        }); 
    }); 
}   

exports.listGroups = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
      var query = Group.find();
      query.select('captain image name route members');
      query.populate('route', 'name');
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
};



function alreadyMember (members, id){
    var i = 0;
    var alreadyMember = false;
    while (i < members.length && !alreadyMember){
        if (members[i].idMember.equals(id))
            alreadyMember = true;
        i++;
    }
    return alreadyMember;
}


