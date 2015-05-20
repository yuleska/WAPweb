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

     app.route('/api/cms/logout/:id')
        .post(users.logout);

    app.route('/api/cms/read/:id')
        .post(users.read);

    app.route('/api/cms/walker/register/:id')
        .post(users.registerWalker);

   	app.route('/api/cms/walker/list/:id')
        .post(users.listWalkers);

    app.route('/api/cms/walker/read/:id')
        .post(users.readWalker);

    app.route('/api/cms/walker/info/:id')
        .post(users.updateInfoWalker);

    app.route('/api/cms/walker/update/password/:id')
        .post(users.updatePasswordWalker);

    app.route('/api/cms/walker/update/status/:id')
        .post(users.updateStatusWalker);

    app.route('/api/cms/walker/update/diet/:id')
        .post(users.updateDietWalker);

    app.route('/api/cms/walker/update/exercise/:id')
        .post(users.updateExerciseWalker);

    app.route('/api/cms/home/:id')
        .post(users.home);

    app.route('/api/cms/group/route/:id')
        .post(users.groupsByRoute);

    app.route('/api/cms/group/list/:id')
        .post(users.listGroups);

    app.route('/api/cms/group/create/:id')
        .post(users.createGroup);

    app.route('/api/cms/group/read/:id')
        .post(users.getGroup);

    app.route('/api/cms/walker/group/:id')
        .post(users.setGroupWalker);
   
};
