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
        var coordinatesJSON = JSON.parse(req.body.coordinates);
        var route = new Route();
        route.name = req.body.name;
        route.distance = req.body.distance;     
        route.coordinates.push(coordinatesJSON.coordinates[0]);
        route.owner = walker._id; 
        route.save(function(err) {
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

exports.editName = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Route.findById(req.body.routeID, function(err, route){
            route.name = req.body.newName;
            route.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = 4;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    var ret = {};
                    ret.error = 0;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                }
            });
        });
    });
}

exports.deleteRoute = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Route.findById(req.body.routeID, function(err, route){
            if (route.owner.equals(walker._id)){
                var found = false;
                var i = 0;
                route.remove();
                walker.save();
                ret.error = 0;
                return res.status(200).jsonp(ret);  
            }
        });
    });
}

exports.read = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Route.findById(req.body.routeID, function(err, route){
                var ret = {};
                ret.route = route;
                ret.error = 0;
                return res.status(200).jsonp(ret);  
        });
    });
}

exports.getAll = function(req, res) {
    utils.checkCredentials(req.params.id,req.body.token,function (checkCredentials,walker){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        Route.find().sort('-created').populate('owner', 'displayName').exec(function(err, routes) {
                var ret = {};
                ret.routes = routes;
                ret.error = 0;
                return res.status(200).jsonp(ret);  
        });
    });
}