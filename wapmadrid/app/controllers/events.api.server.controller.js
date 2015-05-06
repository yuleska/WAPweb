'use strict';

/**
 * Module dependencies.
 */

 var _ = require('lodash'),
    mongoose = require('mongoose'),
    Walker = mongoose.model('Event'),
    User = mongoose.model('User'),
    utils = require('./utils.js');


/**
 * Register Walker
 */
exports.getEvents = function(req, res) {
    Events.find().sort('-created').populate('owner', 'name image _id').exec(function(err, walkers) {
        if (err) {
                var ret = {};
                ret.error = 1;
                ret.error_message = err;
                return res.status(200).jsonp(ret);  
            } else {
                var ret = {};
                ret.error = 0;
                ret.events = events;
                return res.status(200).jsonp(ret);  
            }
    });
}

exports.createEvent = function(req, res) {
    utils.checkCredentialsUser(req.params.id,req.body.token,function (checkCredentials,user){
        if (checkCredentials.error != "0")
            return res.status(200).jsonp(checkCredentials);
        var evento = new Event(req.body);  
        evento.save(function(err) {
                if (err) {
                    var ret = {};
                    ret.error = err.code;
                    ret.error_message = err;
                    return res.status(200).jsonp(ret);  
                } else {
                    var ret = {};
                    ret.error = 0;
                    //aniadir evento a user
                    return res.status(200).jsonp(ret);  
                }
            });
    });

}
