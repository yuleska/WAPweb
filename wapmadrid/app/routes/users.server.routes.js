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
   
};
