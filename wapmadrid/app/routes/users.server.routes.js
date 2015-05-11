'use strict';

/**
 * Module dependencies.
 */

module.exports = function(app) {
    
    var users = require('../../app/controllers/users.api.server.controller');

    app.route('/api/cms/register')
        .post(users.register);

    app.route('/api/cms/login')
        .post(users.login);

    app.route('/api/cms/read/:id')
        .post(users.read);

    app.route('/api/cms/walker/register/:id')
        .post(users.registerWalker);

   	app.route('/api/cms/walker/list/:id')
        .post(users.listWalkers);

    app.route('/api/cms/walker/read/:id')
        .post(walkers.readWalker);

    app.route('/api/cms/walker/info/:id')
        .post(walkers.updateInfoWalker);

    app.route('/api/cms/walker/update/password/:id')
        .post(walkers.updatePasswordWalker);

    app.route('/api/cms/walker/update/status/:id')
        .post(walkers.updateStatusWalker);

    app.route('/api/cms/walker/update/diet/:id')
        .post(walkers.updateDietWalker);

    app.route('/api/cms/walker/update/exercise/:id')
        .post(walkers.updateExerciseWalker);
   
};
