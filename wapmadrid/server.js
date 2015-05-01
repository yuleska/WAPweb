'use strict';
/**
 * Module dependencies.
 */
var config = require('./config/config'),
	mongoose = require('mongoose');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect('mongodb://localhost/wapmadrid', function(err) {
	if (err) {
		console.error('Could not connect to MongoDB!');
		console.log(err);
	} else {
		console.log('Connected to DB');
	}
});

// Init the express application
var app = require('./config/express')(db);



// Start the app by listening on <port>
app.listen(3100);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('API started on port ' + 3100);