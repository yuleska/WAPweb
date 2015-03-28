'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    Walker = mongoose.model('Walker');

/**
 * Walker middleware
 */
exports.walkerByID = function(req, res, next, id) {
    Walker.findOne({
        _id: id
    }).exec(function(err, walker) {
        if (err) return next(err);
        if (!walker) return next(new Error('Failed to load Walker ' + id));
        req.profile = walker;
        next();
    });
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send({
            message: 'Walker is not logged in'
        });
    }

    next();
};

/**
 * Walker authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
    var _this = this;

    return function(req, res, next) {
        _this.requiresLogin(req, res, function() {
            if (_.intersection(req.walker.roles, roles).length) {
                return next();
            } else {
                return res.status(403).send({
                    message: 'Walker is not authorized'
                });
            }
        });
    };
};
