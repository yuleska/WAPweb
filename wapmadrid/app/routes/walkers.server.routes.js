'use strict';

/**
 * Module dependencies.
 */

var passport = require('passport');

module.exports = function(app) {

    var users = require('../../app/controllers/users.server.controller');
    var walkers = require('../../app/controllers/walkers.server.controller');

    // Walkers Routes
    app.route('/walkers')
        .get(walkers.list)
        .post(users.requiresLogin, walkers.create);

    app.route('/walkers/:walkerId')
        .get(walkers.read)
        .put(users.requiresLogin, walkers.hasAuthorization, walkers.update)
        .delete(users.requiresLogin, walkers.hasAuthorization, walkers.delete);

    // Finish by binding the Walker middleware
    app.param('walkerId', walkers.walkerByID);

    // Walker Routes
    /*var walkers = require('../../app/controllers/walkers.server.controller');

    // Setting up the walkers profile api
    app.route('/walkers/me').get(walkers.me);
    app.route('/walkers').put(walkers.update);
    app.route('/walkers/accounts').delete(walkers.removeOAuthProvider);

    // Setting up the walkers password api
    app.route('/walkers/password').post(walkers.changePassword);
    app.route('/auth/forgot').post(walkers.forgot);
    app.route('/auth/reset/:token').get(walkers.validateResetToken);
    app.route('/auth/reset/:token').post(walkers.reset);

    // Setting up the walkers authentication api
    app.route('/auth/signup').post(walkers.signup);
    app.route('/auth/signin').post(walkers.signin);
    app.route('/auth/signout').get(walkers.signout);

    // Finish by binding the walker middleware
    app.param('walkerId', walkers.walkerByID);*/
};



/*'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var walkers = require('../../app/controllers/walkers.server.controller');

    // Walkers Routes
    app.route('/walkers')
        .get(walkers.list)
        .post(users.requiresLogin, walkers.create);

    app.route('/walkers/:walkerId')
        .get(walkers.read)
        .put(users.requiresLogin, walkers.hasAuthorization, walkers.update)
        .delete(users.requiresLogin, walkers.hasAuthorization, walkers.delete);

    // Finish by binding the Walker middleware
    app.param('walkerId', walkers.walkerByID);
};*/
