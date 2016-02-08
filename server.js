'use strict';

var argv =          require('minimist')(process.argv.slice(2));
var express         = require('express');
var mongoose        = require('mongoose');
var port            = parseInt(argv.p) || 3000;
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var app             = express();
var fs              = require('fs');

// Express Configuration
// -----------------------------------------------------
// Sets the connection to MongoDB
mongoose.connect("mongodb://localhost:27017");

// sets the static files location to public
app.use(express.static(__dirname + '/public'));
//for using the bower components installed
app.use('/public/bower_components',  express.static(__dirname + '/bower_components'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
app.use(methodOverride());


// Listen
// -------------------------------------------------------
var server = app.listen(port);
console.log('Blood App listening on port ' + port);

var io = require('socket.io')(server);

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('disconnect', function() {
    console.log('user disconnected');

  });
});

// Routes
// ------------------------------------------------------
require('./app/routes.js')(app, io);
module.exports = app;