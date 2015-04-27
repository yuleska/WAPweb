'use strict';

var passport = require('passport');

module.exports = function(app) {

	var users = require('../../app/controllers/users.server.controller');
    var walkers = require('../../app/controllers/walkers.api.server.controller');
    var groups = require('../../app/controllers/groups.api.server.controller');

    // Walkers Routes
    app.route('/api/walkers')
        .get(walkers.list);

    app.route('/api/walkers/register')
        .post(walkers.register);

    app.route('/api/walkers/login')
        .post(walkers.login);

    app.route('/api/walkers/logout/:id')
        .post(walkers.logout);

    app.route('/api/walkers/read/:id')
        .post(walkers.read);

    app.route('/api/walkers/update/info/:id')
        .post(walkers.updateInfo);

    app.route('/api/walkers/update/password/:id')
        .post(walkers.updatePassword);

    app.route('/api/walkers/update/status/:id')
        .post(walkers.updateStatus);

    app.route('/api/walkers/update/diet/:id')
        .post(walkers.updateDiet);

    app.route('/api/walkers/update/exercise/:id')
        .post(walkers.updateExercise);

    app.route('/api/walkers/upload/stats/:id')
        .post(walkers.uploadStats);

    app.route('/api/walkers/cms/:id')
        .post(walkers.getCms);

    app.route('/api/walkers/cms/:id')
        .put(walkers.setCms);
        
    app.route('/api/walkers/groups/:id')
        .post(walkers.getGroups);

    app.route('/api/walkers/groups/:id')
        .delete(walkers.deleteGroup);

    app.route('/api/walkers/friends/:id')
        .post(walkers.getFriends);

    app.route('/api/walkers/friends/:id')
        .put(walkers.setFriends);

    app.route('/api/walkers/friends/response/:id')
        .post(walkers.responseFriendRequest);

    app.route('/api/walkers/friends/:id')
        .delete(walkers.deleteFriend);

    // Groups Management Routes
    app.route('/api/groups/create/:id')
        .post(groups.create);

    app.route('/api/groups/join/:id')
        .post(groups.join);

    app.route('/api/groups/join/response/:id')
        .post(groups.responseJoinRequest);

    app.route('/api/groups/leave/:id')
        .post(groups.leaveGroup);
    // Finish by binding the Wappy middleware
  /*  app.param('wappyId', walkers.wappyByID);*/
};