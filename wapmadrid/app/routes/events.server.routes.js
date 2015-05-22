'use strict';

/**
 * Module dependencies.
 */

module.exports = function(app) {

   var events = require('../../app/controllers/events.api.server.controller');

    app.route('/api/events')
        .get(events.getEvents);
    app.route('/api/events/:id')
        .post(events.createEvent);
};
