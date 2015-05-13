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
  [X] Improve interface (add menu for all functionality at the top)
  [X] Improve paths, 
    * /app path (app/main, app/data, app/data_reset, app/data_add)
    * /form path (form/main, form/logs/ form/logs_reset, form/stop, form/serve, form/notready)
  [X] Change titles of each page to reflect what they are
  [X] Explore possibility of submitting when DOMReady rather than ready (no CCS)

IMPROVEMENTS
  [ ] Add codes to the code
  [ ] Have a select list of clientName/codes,
  [ ] Change clients so that they fetch the URL and THEN start asking
  [ ] Improve logging: response header, first page, changed page, etc.  
  [ ] Check that logs are sucessfully sent even if they are > 20Mb
  [ ] Show a current status, with number of requests and current action happening
  [ ] Show the server's date and time at the beginning, and after each request
  [ ] In the log view, show the difference in ms between submitting and receiving by matching clientId
  [ ] Add screen to set URL for clients
  [ ] Add mechanism to fetch URL automatically
  [ ] Delay between reloads
  [ ] Add flag to prevent automatic submission

  HARDEN
  [ ] Deal with redirects, in header OR in meta
  [ ] Deal with form changing a little, but without form itself -- which will trigger reload
  [ ] Add checkbox to prevent automatic submitting


NEXT YEAR
---------

  OPEN & GO APP
  [ ] Allow customers to login and get the app page with the code pre-filled in
  [ ] If "preset", take out everything from interface except the status messages with countdown etc.
  [ ] If "preset", wait for URL from the server, and start working as soon as URL is there
  [ ] Add remote logging ablity on server, to log client logins etc.
  [ ] Send logs automatically at the end of the procedure

  HEADELESS
  [ ] Make a server that will launch N "open & go" pages in headless browsers

*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');

var routesApp = require('./routes/routesApp');
var routesForm = require('./routes/routesForm');
var codes = require('./codes');
//var users = require('./routes/users');

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


/* Redirect to /app if / is requested */
var router = express.Router();
router.get('/', function(req, res, next) {
  res.redirect('/app/main');
});
app.use( '/', router );

app.use('/app', routesApp);
app.use('/form', routesForm);

//app.use('/users', users);

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
