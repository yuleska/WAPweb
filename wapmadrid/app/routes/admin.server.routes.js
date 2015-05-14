'use strict';

/**
 * Module dependencies.
 */

module.exports = function(app) {
    
    var admin = require('../../app/controllers/admin.api.server.controller');

    app.route('/api/admin/login')
        .post(admin.login);

    app.route('/api/admin/cms/register/:id')
        .post(admin.registerCms);

    app.route('/api/admin/cms/update/:id')
        .post(admin.updateCms);

    app.route('/api/admin/cms/read/:id')
        .post(admin.readCms);

    app.route('/api/admin/cms/read/all/:id')
        .post(admin.readAllCms);

    app.route('/api/admin/update/password/:id')
        .post(admin.updatePassword);

    app.route('/api/admin/')
        .post(admin.registerAdmin);
   
};
