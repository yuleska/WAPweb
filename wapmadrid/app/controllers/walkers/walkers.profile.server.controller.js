'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    Walker = mongoose.model('Walker');

/**
 * Create a Walker
 */
/*exports.create = function(req, res) {
    var walker = new Walker(req.body);
    walker.user = req.user;

    walker.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(walker);
        }
    });
};

/**
 * Update walker details
 */
exports.update = function(req, res) {
    // Init Variables
    var walker = req.walker;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    if (walker) {
        // Merge existing walker
        walker = _.extend(walker, req.body);
        walker.updated = Date.now();
        walker.displayName = walker.firstName + ' ' + walker.lastName;

        walker.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

                res.json(walker);
            }
        });
    } else {
        res.status(400).send({
            message: 'Walker is not signed in'
        });
    }
};

/**
 * List of Walkers
 */
exports.list = function(req, res) {
    Walker.find().sort('-created').populate('user', 'displayName').exec(function(err, walkers) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(walkers);
        }
    });
};

/**
 * Show the current Walker
 */
exports.read = function(req, res) {
    res.jsonp(req.walker);
};

/**
 * Delete an Walker
 */
exports.delete = function(req, res) {
    var walker = req.walker;

    walker.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(walker);
        }
    });
};

/**
 * Send Walker
 */
exports.me = function(req, res) {
    res.json(req.walker || null);
};
