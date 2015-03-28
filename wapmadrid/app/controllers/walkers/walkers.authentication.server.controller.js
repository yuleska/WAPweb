'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    Walker = mongoose.model('Walker');

/**
 * Signup
 */
exports.signup = function(req, res) {
    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    // Init Variables
    var walker = new Walker(req.body);
    var message = null;

    // Add missing walker fields
    walker.provider = 'local';
    walker.displayName = walker.firstName + ' ' + walker.lastName;

    // Then save the walker 
    walker.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            // Remove sensitive data before login
            walker.password = undefined;
            walker.salt = undefined;

            req.login(walker, function(err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.json(walker);
                }
            });
        }
    });
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
    passport.authenticate('local', function(err, walker, info) {
        if (err || !walker) {
            res.status(400).send(info);
        } else {
            // Remove sensitive data before login
            walker.password = undefined;
            walker.salt = undefined;

            req.login(walker, function(err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.json(walker);
                }
            });
        }
    })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Create a Walker
 */
exports.create = function(req, res) {
    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    // Init Variables
    var walker = new Walker(req.body);
    var message = null;
    walker.user = req.user;

    // Add missing walker fields
    walker.provider = 'local';
    walker.displayName = walker.firstName + ' ' + walker.lastName;

    // Then save the walker 
    walker.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            // Remove sensitive data before login
            walker.password = undefined;
            walker.salt = undefined;

            res.json(walker);
        }
    });
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
    return function(req, res, next) {
        passport.authenticate(strategy, function(err, walker, redirectURL) {
            if (err || !walker) {
                return res.redirect('/#!/signin');
            }
            req.login(walker, function(err) {
                if (err) {
                    return res.redirect('/#!/signin');
                }

                return res.redirect(redirectURL || '/');
            });
        })(req, res, next);
    };
};

/**
 * Helper function to save or update a OAuth walker profile
 */
exports.saveOAuthWalkerProfile = function(req, providerWalkerProfile, done) {
    if (!req.walker) {
        // Define a search query fields
        var searchMainProviderIdentifierField = 'providerData.' + providerWalkerProfile.providerIdentifierField;
        var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerWalkerProfile.provider + '.' + providerWalkerProfile.providerIdentifierField;

        // Define main provider search query
        var mainProviderSearchQuery = {};
        mainProviderSearchQuery.provider = providerWalkerProfile.provider;
        mainProviderSearchQuery[searchMainProviderIdentifierField] = providerWalkerProfile.providerData[providerWalkerProfile.providerIdentifierField];

        // Define additional provider search query
        var additionalProviderSearchQuery = {};
        additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerWalkerProfile.providerData[providerWalkerProfile.providerIdentifierField];

        // Define a search query to find existing walker with current provider profile
        var searchQuery = {
            $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
        };

        Walker.findOne(searchQuery, function(err, walker) {
            if (err) {
                return done(err);
            } else {
                if (!walker) {
                    var possibleUsername = providerWalkerProfile.username || ((providerWalkerProfile.email) ? providerWalkerProfile.email.split('@')[0] : '');

                    Walker.findUniqueUsername(possibleUsername, null, function(availableUsername) {
                        walker = new Walker({
                            firstName: providerWalkerProfile.firstName,
                            lastName: providerWalkerProfile.lastName,
                            username: availableUsername,
                            displayName: providerWalkerProfile.displayName,
                            email: providerWalkerProfile.email,
                            provider: providerWalkerProfile.provider,
                            providerData: providerWalkerProfile.providerData
                        });

                        // And save the walker
                        walker.save(function(err) {
                            return done(err, walker);
                        });
                    });
                } else {
                    return done(err, walker);
                }
            }
        });
    } else {
        // Walker is already logged in, join the provider data to the existing walker
        var walker = req.walker;

        // Check if walker exists, is not signed in using this provider, and doesn't have that provider data already configured
        if (walker.provider !== providerWalkerProfile.provider && (!walker.additionalProvidersData || !walker.additionalProvidersData[providerWalkerProfile.provider])) {
            // Add the provider data to the additional provider data field
            if (!walker.additionalProvidersData) walker.additionalProvidersData = {};
            walker.additionalProvidersData[providerWalkerProfile.provider] = providerWalkerProfile.providerData;

            // Then tell mongoose that we've updated the additionalProvidersData field
            walker.markModified('additionalProvidersData');

            // And save the walker
            walker.save(function(err) {
                return done(err, walker, '/#!/settings/accounts');
            });
        } else {
            return done(new Error('Walker is already connected using this provider'), walker);
        }
    }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
    var walker = req.walker;
    var provider = req.param('provider');

    if (walker && provider) {
        // Delete the additional provider
        if (walker.additionalProvidersData[provider]) {
            delete walker.additionalProvidersData[provider];

            // Then tell mongoose that we've updated the additionalProvidersData field
            walker.markModified('additionalProvidersData');
        }

        walker.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(walker, function(err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(walker);
                    }
                });
            }
        });
    }
};
