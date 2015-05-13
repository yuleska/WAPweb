'use strict';

module.exports = function(app) {

	var routes = require('../../app/controllers/routes.api.server.controller');

	app.route('/api/routes/:id')
        .post(routes.read);	 

    app.route('/api/routes/all/:id')
        .post(routes.getAll);	 

	app.route('/api/routes/create/:id')
        .post(routes.create);	 
    
    app.route('/api/routes/edit/:id')
        .post(routes.editName);

    app.route('/api/routes/delete/:id')
        .post(routes.deleteRoute);
};