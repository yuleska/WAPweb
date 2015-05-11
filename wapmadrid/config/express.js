'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    morgan = require('morgan'),
    corser = require('corser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    helmet = require('helmet'),
    mongoStore = require('connect-mongo')({
        session: session
    }),
    config = require('./config'),
    path = require('path');

module.exports = function(db) {
    // Initialize express app
    var app = express();

    var router = express.Router();

    router.get('/', function(req, res) {
       res.send("End of the road");
    });

    router.post('/', function(req, res) {
       res.send(req.body);
    });

    app.use(router);
    // Globbing model files
    config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
        require(path.resolve(modelPath));
    });

    app.use(corser.create({
        methods: corser.simpleMethods.concat(["PUT"]),
        requestHeaders: corser.simpleRequestHeaders.concat(["X-Requested-With"])
    }));
    app.all('*', function(request, response, next) {
        response.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With,Authorization,Access-Control-Allow-Origin');
        response.header('Access-Control-Allow-Methods', 'POST,GET,DELETE');
        response.header('Access-Control-Allow-Origin', '*');
        next();
    });

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;

    // Should be placed before express.static
    app.use(compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Showing stack errors
    app.set('showStackError', false);

    app.use(morgan('dev'));

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Express MongoDB session storage
    app.use(session({
        secret: 'wappies',
        saveUninitialized: true,
        resave: true,
        store: new mongoStore({
            db: db.connection.db,
            collection: config.sessionCollection
        })
    }));


    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    // Setting the app router and static folder
  //  app.use(express.static(path.resolve('./public')));

    // Globbing routing files
    config.getGlobbedFiles('./app/routes/*.js').forEach(function(routePath) {
        require(path.resolve(routePath))(app);
    });

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function(err, req, res, next) {
        // If the error object doesn't exists
        if (!err) return next();

        // Log it
        console.error(err.stack);

        // Error page
        res.status(500).render('500', {
            error: err.stack
        });
    });

    // Assume 404 since no middleware responded
    app.use(function(req, res) {
        var ret = {};
        ret.error = "NotFound"
        res.status(404).jsonp(ret); 
    });

    // Return Express server instance
    return app;
};
