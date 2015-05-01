'use strict';

module.exports = function(app) {
	
	var groups = require('../../app/controllers/groups.api.server.controller');

    // Groups Management Routes
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
};