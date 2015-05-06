'use strict';

module.exports = function(app) {
	
	var groups = require('../../app/controllers/groups.api.server.controller');

    // Groups Management Routes
	app.route('/api/groups/:id')
        .post(groups.getGroup);

    app.route('/api/groups/:id')
        .delete(groups.deleteGroup);

    app.route('/api/groups/create/:id')
        .post(groups.create);

    app.route('/api/groups/join/:id')
        .post(groups.join);

    app.route('/api/groups/join/response/:id')
        .post(groups.responseJoinRequest);

    app.route('/api/groups/expulse/:id')
        .post(groups.expulseFromGroup);

    app.route('/api/groups/leave/:id')
        .post(groups.leaveGroup);

    app.route('/api/groups/members/:id')
        .post(groups.listMembers);

    app.route('/api/groups/messages/:id')
        .put(groups.sendMessage);

    app.route('/api/groups/messages/:id')
        .post(groups.getMessages);

    app.route('/api/groups/captain/:id')
    	.put(groups.changeCaptain);
};