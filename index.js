var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/', function(req, res) {
	console.log('wake up');
	res.json({
		message: 'waking up'
	});
});

// var Agendash = require('agendash');

app.listen(port, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Listening on port" + port + ".");
	}

});

///// For Heroku idling Start//////////

/*var http = require('http'); //importing http

function startKeepAlive() {
	setInterval(function() {
		var options = {
			host: 'send-mailer.herokuapp.com',
			port: 80,
			path: '/'
		};
		http.get(options, function(res) {
			res.on('data', function(chunk) {
				try {
					// optional logging... disable after it's working
					console.log("HEROKU RESPONSE: " + chunk);
				} catch (err) {
					console.log(err.message);
				}
			});
		}).on('error', function(err) {
			console.log("Error: " + err.message);
		});
	}, 20 * 60 * 1000); // load every 20 minutes
}

startKeepAlive();*/
/////For Heroku Idling End/////////

var nodemailer = require('nodemailer');
var Agenda = require('agenda');

var mongoose = require('mongoose');

var mongoConnectionString = 'mongodb://umang:umang@ds149278.mlab.com:49278/peernetwork';

var agenda = new Agenda({
	db: {
		address: mongoConnectionString,
	}
});

function removeStaleJobs(callback) {
	agenda._collection.update({
		lockedAt: {
			$exists: true
		}
	}, {
		$set: {
			lockedAt: null
		}
	}, {
		multi: true
	}, callback);
}
// app.use('/dash', Agendash(agenda));

agenda.on('ready', function() {

	removeStaleJobs(function(e, r) {
		if (e) {
			console.error("Unable to remove stale jobs. Starting anyways.");
		}
		agenda.start();
	});
});

agenda.on('error', function(err) {
	console.log(err);
});

agenda.on('fail:send email', function(err, job) {
	console.log('Job failed with error: %s', err.message);
});

agenda.on('start', function(job) {
	console.log('Job %s starting', job.attrs.name);
});

agenda.on('complete', function(job) {
	console.log('Job %s finished', job.attrs.name);
});

var api = require('./app/routes/api')(app, express, agenda);
app.use('/api', api);
