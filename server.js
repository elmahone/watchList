#!/bin/env node
 //  OpenShift sample Node application
var express = require('express');
var app = express();
var fs = require('fs');
var mongoClient = require('mongodb').MongoClient;



/**
 *  Define the sample application.
 */
var SampleApp = function () {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function () {
        if (typeof self.zcache === "undefined") {
            self.zcache = {
                'index.html': '',
                'signup.html': '',
                'login.html': '',
                'mylist.html': '',
                'details.html': ''

            };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./public/index.html');
        self.zcache['signup.html'] = fs.readFileSync('./public/signup.html');
        self.zcache['login.html'] = fs.readFileSync('./public/login.html');
        self.zcache['mylist.html'] = fs.readFileSync('./public/mylist.html');
        self.zcache['details.html'] = fs.readFileSync('./public/details.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function (key) {
        return self.zcache[key];
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function () {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };
    // default to a 'localhost' configuration:
    var connection_string = '127.0.0.1:27017/YOUR_APP_NAME';
    // if OPENSHIFT env variables are present, use the available connection info:
    if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
        connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
    }

    //load the Client interface
    var MongoClient = require('mongodb').MongoClient;

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function () {
        self.routes = {};


        // Adds item to personal list
        self.routes['/addToList'] = function (req, res) {
            MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                db.collection('user').update({
                    username: req.query.username
                }, {
                    $push: {
                        list: {
                            id: req.query.id,
                            title: req.query.title,
                            type: req.query.type
                        }
                    }
                });
                db.close();
            });
        };
        // Adds a user to the database
        self.routes['/addUser'] = function (req, res) {
            MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                db.collection('user').insert({
                    username: req.query.username,
                    password: req.query.password,
                    list: [],
                    searches: []
                });
                db.close();
            });
        };
        // Returns users watchlist for username in parameters
        self.routes['/getMyList'] = function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                db.collection('user').find({
                    username: req.query.username
                }).toArray(function (err, docs) {
                    res.send(docs[0].list);
                    db.close();
                });
            });
        };
        // Returns users watchlist for username in parameters
        self.routes['/getUser'] = function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                db.collection('user').find({
                    username: req.query.username,
                    password: req.query.password
                }).toArray(function (err, docs) {
                    res.send({
                        response: "OK"
                    });
                    db.close();
                });
            });
        };
        // Returns users recent searches for username in parameters
        self.routes['/getRecentSearches'] = function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                db.collection('user').find({
                    username: req.query.username
                }).toArray(function (err, docs) {
                    var response = docs[0].searches;
                    response = response.reverse();
                    res.send(response);
                    db.close();
                });
            });
        };
        // Returns all searches
        self.routes['/getSearches'] = function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                db.collection('searches').find({}).toArray(function (err, docs) {
                    res.send(docs);
                    db.close();
                });
            });
        };
        // Removes an item from personal list
        self.routes['/removeFromList'] = function (req, res) {
            MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                db.collection('user').update({
                    username: req.query.username
                }, {
                    $pull: {
                        list: {
                            id: req.query.id
                        }
                    }
                });

            });
        };
        // Saves a searched title to database 
        self.routes['/saveSearchTitle'] = function (req, res) {
            MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                db.collection('searches').insert({
                    title: req.query.title
                });
                db.close();
            });
        };
        // Saves a searched title into users recent searches
        self.routes['/saveRecentSearch'] = function (req, res) {
            MongoClient.connect('mongodb://' + connection_string, function (err, db) {
                if (err) throw err;
                db.collection('user').update({
                    username: req.query.username
                }, {
                    $push: {
                        searches: {
                            title: req.query.title
                        }
                    }
                });
                db.close();
            });
        };

        // Index
        self.routes['/'] = function (req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html'));
        };
        // My List
        self.routes['/mylist'] = function (req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('mylist.html'));
        };
        // Sign up
        self.routes['/signup'] = function (req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('signup.html'));
        };
        // Log In
        self.routes['/login'] = function (req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('login.html'));
        };
        // Details
        self.routes['/details'] = function (req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('details.html'));
        };
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function () {
        self.createRoutes();
        self.app = app;
        self.app.use(express.static(__dirname + '/public'));

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function () {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

}; /*  Sample Application.  */

/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();