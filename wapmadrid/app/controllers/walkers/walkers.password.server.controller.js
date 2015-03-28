'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    Walker = mongoose.model('Walker'),
    config = require('../../../config/config'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    crypto = require('crypto');

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res, next) {
    async.waterfall([
        // Generate random token
        function(done) {
            crypto.randomBytes(20, function(err, buffer) {
                var token = buffer.toString('hex');
                done(err, token);
            });
        },
        // Lookup walker by username
        function(token, done) {
            if (req.body.username) {
                Walker.findOne({
                    username: req.body.username
                }, '-salt -password', function(err, walker) {
                    if (!walker) {
                        return res.status(400).send({
                            message: 'No account with that username has been found'
                        });
                    } else if (walker.provider !== 'local') {
                        return res.status(400).send({
                            message: 'It seems like you signed up using your ' + walker.provider + ' account'
                        });
                    } else {
                        walker.resetPasswordToken = token;
                        walker.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                        walker.save(function(err) {
                            done(err, token, walker);
                        });
                    }
                });
            } else {
                return res.status(400).send({
                    message: 'Username field must not be blank'
                });
            }
        },
        function(token, walker, done) {
            res.render('templates/reset-password-email', {
                name: walker.displayName,
                appName: config.app.title,
                url: 'http://' + req.headers.host + '/auth/reset/' + token
            }, function(err, emailHTML) {
                done(err, emailHTML, walker);
            });
        },
        // If valid email, send reset email using service
        function(emailHTML, walker, done) {
            var smtpTransport = nodemailer.createTransport(config.mailer.options);
            var mailOptions = {
                to: walker.email,
                from: config.mailer.from,
                subject: 'Password Reset',
                html: emailHTML
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (!err) {
                    res.send({
                        message: 'An email has been sent to ' + walker.email + ' with further instructions.'
                    });
                }

                done(err);
            });
        }
    ], function(err) {
        if (err) return next(err);
    });
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
    Walker.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function(err, walker) {
        if (!walker) {
            return res.redirect('/#!/password/reset/invalid');
        }

        res.redirect('/#!/password/reset/' + req.params.token);
    });
};

/**
 * Reset password POST from email token
 */
exports.reset = function(req, res, next) {
    // Init Variables
    var passwordDetails = req.body;

    async.waterfall([

        function(done) {
            Walker.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function(err, walker) {
                if (!err && walker) {
                    if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                        walker.password = passwordDetails.newPassword;
                        walker.resetPasswordToken = undefined;
                        walker.resetPasswordExpires = undefined;

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
                                        // Return authenticated walker 
                                        res.json(walker);

                                        done(err, walker);
                                    }
                                });
                            }
                        });
                    } else {
                        return res.status(400).send({
                            message: 'Passwords do not match'
                        });
                    }
                } else {
                    return res.status(400).send({
                        message: 'Password reset token is invalid or has expired.'
                    });
                }
            });
        },
        function(walker, done) {
            res.render('templates/reset-password-confirm-email', {
                name: walker.displayName,
                appName: config.app.title
            }, function(err, emailHTML) {
                done(err, emailHTML, walker);
            });
        },
        // If valid email, send reset email using service
        function(emailHTML, walker, done) {
            var smtpTransport = nodemailer.createTransport(config.mailer.options);
            var mailOptions = {
                to: walker.email,
                from: config.mailer.from,
                subject: 'Your password has been changed',
                html: emailHTML
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
    });
};

/**
 * Change Password
 */
exports.changePassword = function(req, res) {
    // Init Variables
    var passwordDetails = req.body;

    if (req.walker) {
        if (passwordDetails.newPassword) {
            Walker.findById(req.walker.id, function(err, walker) {
                if (!err && walker) {
                    if (walker.authenticate(passwordDetails.currentPassword)) {
                        if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                            walker.password = passwordDetails.newPassword;

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
                                            res.send({
                                                message: 'Password changed successfully'
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            res.status(400).send({
                                message: 'Passwords do not match'
                            });
                        }
                    } else {
                        res.status(400).send({
                            message: 'Current password is incorrect'
                        });
                    }
                } else {
                    res.status(400).send({
                        message: 'Walker is not found'
                    });
                }
            });
        } else {
            res.status(400).send({
                message: 'Please provide a new password'
            });
        }
    } else {
        res.status(400).send({
            message: 'Walker is not signed in'
        });
    }
};
