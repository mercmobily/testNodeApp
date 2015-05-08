/*
TODO:

SERVER
  [X] Add waiting page as optional page, make it activate after 5 seconds of going to specific URL
  [X] Enable MongoDB 
  [X] Log each form post
  [X] Write page to show logs, most recent first, showing all submitted fields
  [X] Make sure logs for sent forms appear too
  [X] Add link to delete all logs and start over
  [X] Make sure app is all good and it installs
  [X] Write little deployment script and deploy
  [X] Send Alessandro the links

CLIENT
  [ ] Work out switch for security off, chrome switch
  [ ] Make basic form with URL and code
  [ ] Make second frame
  [ ] Make second frame reload continuouly till contents change
  [ ] When page changes, activate submitter:
    [ ] Find visible form
    [ ] Find visible <input> in form
    [ ] Submit code into form programmatically
  [ ] Test the hell out of it

*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var globals = require('./globals.js');

var MongoClient = require('mongodb').MongoClient
  , Server = require('mongodb').Server;

// Connect to mongoDB, assign it to global's db
MongoClient.connect("mongodb://localhost/inail", function( err, db ) {
  if( err ){
    console.log("Error establishing mongo connection: ", err );
    process.exit( 1 );
  }
  console.log( "DB Connected, ready to go!" );
  globals.db = db;
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser('woodchucks are nasty animals!!!'));
app.use(cookieSession({ secret: 'woodchucks are nasty animals!!!' }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
