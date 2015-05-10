"use strict"
var express = require('express');
var router = express.Router();
var globals = require( '../globals.js');
var auth = require('basic-auth');

function protect(req, res, next) {
  var user = auth(req);

  if (user === undefined || user['name'] !== 'ale' || user['pass'] !== 'ale') {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
    res.end('Unauthorized');
  } else {
    next();
  }
};

router.get('/main', function(req, res, next) {
	 res.render('app' );
});

router.post('/data_add', function(req, res, next ){

  var db = globals.db;

	var record = {};
	record.code = req.body.code;
  record.url = req.body.url;
  record.added = req.body.added;
  record.data = req.body.data;

	var data = db.collection( 'data' );

  data.insert( record, function( err ){
		if( err ) return done( err );

    res.send('OK');
	})
});


/* GET home page. */
router.get('/data', protect, function(req, res, next) {

  var db = globals.db;
  var data = db.collection( 'data' );


  data.find({}, { sort: { 'added': -1 } } ).toArray( function( err, entries ){
  	if( err ) return next( err );

  	entries.map( function( entry ){
  	  //entry.data = entry.data.split("\n").join("<br />");
    	// Add <br/> for each newline
    	return entry;
    })

    res.render('data', { entries: entries } );
  })
});


/* GET home page. */
router.get('/data_reset', protect, function(req, res, next) {

	var db = globals.db;
  var data = db.collection( 'data' );

  data.remove({}, function( err ){
  	if( err ) return next( err );
		res.redirect('/app/data');
  })
});

module.exports = router;
