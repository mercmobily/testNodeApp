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
  [X] Work out switch for security off, chrome switch
  [X] Make basic form with URL and code
  [X] Make second frame
  [X] Work out which extension I need to make it load ignoring headers
  [X] Make loaded URL configurable
  [X] Make second frame reload continuouly till contents change
  [X] When page changes, activate submitter:
    [X] Find visible form
    [X] Find visible <input> in form
    [X] Submit code into form programmatically
  [X] Test the hell out of it
  [X] Add submission data routes to server 
  [X] Add button to send logs to server
  [X] Add timestamp to each line 
  [ ] Improve interface (add menu for all functionality at the top)
  [ ] Improve logging: response header, first page, changed page, anything else  

  HARDEN
  [ ] Deal with redirects, in header OR in meta
  [ ] Deal with form changing a little, but without form itself -- which will trigger reload
  [ ] Add checkbox to prevent automatic submitting
  [ ] Explore possibility of submitting when DOMReady rather than ready (no CCS)

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
    console.log( err.stack );
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
  console.log( err.stack );

});


module.exports = app;
