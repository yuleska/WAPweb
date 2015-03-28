'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
    require('./walkers/walkers.authentication.server.controller'),
    require('./walkers/walkers.authorization.server.controller'),
    require('./walkers/walkers.password.server.controller'),
    require('./walkers/walkers.profile.server.controller')
);


/**
 * Module dependencies.
 */
/*var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Walker = mongoose.model('Walker'),
    _ = require('lodash');

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
 * Show the current Walker
 */
/*exports.read = function(req, res) {
    res.jsonp(req.walker);
};

/**
 * Update a Walker
 */
/*exports.update = function(req, res) {
    var walker = req.walker;

    walker = _.extend(walker, req.body);

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
 * Delete an Walker
 */
/*exports.delete = function(req, res) {
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
 * List of Walkers
 */
/*exports.list = function(req, res) {
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
 * Walker middleware
 */
/*exports.walkerByID = function(req, res, next, id) {
    Walker.findById(id).populate('user', 'displayName').exec(function(err, walker) {
        if (err) return next(err);
        if (!walker) return next(new Error('Failed to load Walker ' + id));
        req.walker = walker;
        next();
    });
};

/**
 * Walker authorization middleware
 */
/*exports.hasAuthorization = function(req, res, next) {
    if (req.walker.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
*/
