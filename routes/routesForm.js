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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function log( form, req, done ){

  var db = globals.db;

	var b = req.body;
	var logs = db.collection( 'logs' );
	var now = new Date();

	// Check that result is good
	var result = "BAD";
	var delta = 0;
	if( form === 's83' && b['form83:tok'] == '' && b.id81 === req.session.clientId && b.id82 == req.session.spyValue && b[ 'form83:t83'] != '') result = "GOOD!";

	logs.find( { clientId: b.id81, spyValue: b.id82, type: 'FORM_PAGE' }, { sort: { 'added': -1 } } ).toArray( function( err, prevPages ){
	  if( err ) return done( err );

	  // Work out delta, if present
	  if( prevPages && prevPages[ 0 ] ){
	  	var prevPage = prevPages[ 0 ];
	  	delta = now - prevPage.added;
	  }

		logs.insert( { 

			type: 'RESPONSE',

			result: result,

			delta: delta,

			form: form, 

			clientId: req.session.clientId,
			spyValue: req.session.spyValue,

			hiddenForm_id1: b.id1,
			hiddenForm_id2: b.id2,

			goodForm_form83_tok_must_be_empty: b['form83:tok'],
			goodForm_id81: b.id81,
	    goodForm_id82: b.id82,
	    goodForm_form83_t83: b[ 'form83:t83' ],
	    added: now,

		}, function( err ){
			if( err ) return done( err );

			done( null );
		});

	});
}


router.post('/ISI_ClickWeb/ISIServlet', function(req, res, next ){
	if( ! globals.serve ) return res.redirect( '/form/notready' );
	
	log( 'ISIServlet', req, function(err){
		if( err ) return next( err );

    res.render('trap', {});
  });
})

router.post('/2014/s83', function(req, res, next ){
	if( ! globals.serve ) return res.redirect( '/form/notready' );

	log( 's83', req, function(err){
		if( err ) return next( err );

    res.render('real', {});
   });
});


router.get('/notready', function(req, res, next) {
	 res.render('notready' );
});

router.get('/serve', function(req, res, next) {
	globals.serve = true;

	res.redirect('/form/logs');
});

router.get('/stop', function(req, res, next) {
	globals.serve = false;
	res.redirect('/form/main');
});


/* GET home page. */
router.get('/main', function(req, res, next) {

  if( globals.serve ){
  	res.redirect( '/form/realSecret' );
  } else {
    delete req.session;
	  res.render('wait' );
  }
});



/* GET home page. */
router.get('/realSecret', function(req, res, next) {

	if( globals.serve ){

		req.session.clientId = "i*-" + getRandomInt( 111111111, 999999999 );
		req.session.spyValue = randomString( 27, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') + '=';

	  var db = globals.db;

		var b = req.body;
		var logs = db.collection( 'logs' );

		// Check that result is good

		logs.insert( { 

			type: 'FORM_PAGE',
			clientId: req.session.clientId,
			spyValue: req.session.spyValue,
	    added: new Date(),
		}, function( err ){
			if( err ) return done( err );

		  res.render('form', { title: 'Express', clientId: req.session.clientId, spyValue: req.session.spyValue });
		});

	} else {
	  delete req.session;
	  res.render('wait' );
	}
});

/* GET home page. */
router.get('/logs', function(req, res, next) {

  var db = globals.db;
  var logs = db.collection( 'logs' );

  logs.find({}, { sort: { 'added': -1 } } ).toArray( function( err, entries ){
  	if( err ) return next( err );
    res.render('logs', { entries: entries } );
  })
});

/* GET home page. */
router.get('/logs_reset', protect, function(req, res, next) {

	var db = globals.db;
  var logs = db.collection( 'logs' );

  logs.remove({}, function( err ){
  	if( err ) return next( err );
		res.redirect('/form/logs');
  })
});

module.exports = router;
