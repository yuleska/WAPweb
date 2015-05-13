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
                    var groupWalker = {};
                    groupWalker.groupID = group._id;
                    groupWalker.routeID = group.route;
                    groupWalker.accepted = true;
                    groupWalker.rol = "captain";
                    walker.groups.push(groupWalker);
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
}

exports.getGroup = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var query = Group.findById(req.body.groupID).populate('captain', 'profileImage displayName _id');
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
                members.accepted = false;
                group.members.push(members);
                group.save(function(err) {
                    if (err) {
                        var ret = {};
                        ret.error = 5;
                        ret.error_message = err;
                        return res.status(200).jsonp(ret);  
                    } else {
                        var groupWalker = {};
                        groupWalker.groupID = group._id;
                        groupWalker.roles = "user";
                        groupWalker.accepted = false;
                        walker.groups.push(groupWalker);
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
            var idMember  = group.members.id(req.body.id).idMember;
            Walker.findById(idMember,function(err, walkerRequest) {
                var found = false;
                var i;
                var member = null;
                for (i = 0 ; i < walkerRequest.groups.length && !found; i++){
                    var id = walkerRequest.groups[i].groupID;
                    if (id.equals(group._id)){
                        member = walkerRequest.groups[i];
                        found = true;
                    }
                }
                console.log(member);
                if (found && member && req.body.response == "true"){ 
                    group.members.id(req.body.id).accepted = true;
                    walkerRequest.groups.id(member._id).accepted = true;
                } else if ( found && member && req.body.response == "false"){  
                    group.members.id(req.body.id).remove();
                    walkerRequest.groups.id(member._id).remove();
                } else if (!found){
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
                        walkerRequest.save(function(err) {
                            if (err) {
                                var ret = {};
                                ret.error = 8;
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
            var idMember  = group.members.id(req.body.id).idMember;
            Walker.findById(idMember,function(err, walkerRequest) {
                var found = false;
                var i;
                var member = null;
                for (i = 0 ; i < walkerRequest.groups.length && !found; i++){
                    var id = walkerRequest.groups[i].groupID;
                    if (id.equals(group._id)){
                        member = walkerRequest.groups[i];
                        found = true;
                    }
                }
                if (member && found){  
                    group.members.id(req.body.id).remove();
                    walkerRequest.groups.id(member._id).remove();
                } else if (!found){
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
                        walkerRequest.save(function(err) {
                            if (err) {
                                var ret = {};
                                ret.error = 8;
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
           
        });
    }); 
}

exports.leaveGroup = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        
        var request  = walker.groups.id(req.body.id);
        if (!request){
            var ret = {};
            ret.error = 5;
            ret.error_message = "Miembro no encontrado";
            return res.status(200).jsonp(ret);  
        }
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
                walker.groups.id(req.body.id).remove();
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
                    walker.save(function(err) {
                        if (err) {
                            var ret = {};
                            ret.error = 8;
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
            var i = 0;
            var found = false;
            while (i < walker.groups.length && !found){
                if (walker.groups[i].groupID.equals(req.body.groupID)){
                    walker.groups[i].rol = "user";
                    found = true;
                }
                i++;
            }
            Walker.findById(req.body.newCaptainID, function(err, newCaptain){
                var i = 0;
                var found = false;
                while (i < newCaptain.groups.length && !found){
                    if (newCaptain.groups[i].groupID.equals(req.body.groupID)){
                        newCaptain.groups[i].rol = "captain";
                        found = true;
                    }
                    i++;
                } 
                group.save();
                walker.save();
                newCaptain.save();  
                var ret = {};
                ret.error = 0;
                return res.status(200).jsonp(ret);  
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
            var j = 0;
            for (j = 0; j < group.members.length; j++){
                Walker.findById(group.members[j].idMember, function(err, member){
                    var i = 0;
                    var found = false;
                    while (i < member.groups.length && !found){
                        if (member.groups[i].groupID.equals(req.body.groupID)){
                            member.groups.id(member.groups[i]._id).remove();
                            found = true;
                        }
                        i++;
                    }
                    member.save();
                });
            }
            group.remove();
            var ret = {};
            ret.error = 0;
            return res.status(200).jsonp(ret);  
        });
    }); 
}



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


