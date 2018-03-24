var nodemailer = require('nodemailer');

var agenda = require('../../index');
module.exports = function(app, express, agenda) {

	var api = express.Router();

	api.post('/sendMail', function(req, res) {

		var smtpTransport = nodemailer.createTransport({
			service: "gmail",
			secure: false,
			port: 25,
			auth: {
				user: 'peer.exercise@gmail.com',
				pass: 'peer123456'
			},
			tls: {
				rejectUnauthorized: false
			}
		});

		var mailOptions = {
			from: '"Peer Network" <peer.exercise@gmail.com',
			to: req.body.email,
			subject: req.body.subject,
			text: req.body.content
		};

		smtpTransport.sendMail(mailOptions, function(err, res) {
			if (err) {
				console.log(err);
			} else {
				console.log("Message Sent:" + res.message);
			}
		});

		res.json({
			message: "Mail sent!"
		});
	});

	api.post('/scheduleMail', function(req, res) {
		var deadline = req.body.deadline;
		var milestones = req.body.milestones;
		var d = new Date();

		var deadlineDetail = deadline.split('-');

		var deadlineDate = deadlineDetail[2];
		var deadlineMonth = deadlineDetail[1];
		var deadlineYear = deadlineDetail[0];

		var sec = (deadlineDate - d.getDate()) * 24 * 3600;
		console.log(sec);
		var sec1 = sec / milestones;
		console.log(sec1);

		var d1 = new Date();
		var dsec = d1.getSeconds();
		var d2 = d1.getDate();
		console.log(d2);
		while (1) {
			dsec = dsec + sec1;
			var df = new Date(d1.getFullYear(), d1.getMonth(), d2, d1.getHours(), d1.getMinutes(), dsec);
			if (df.getDate() >= deadlineDate) {
				break;
			}
			agenda.schedule(df, 'send email', {
				email: req.body.email,
				subject: req.body.subject,
				content: req.body.content,
				title: req.body.title
			});
		}

		agenda.define('send email', function(job, done) {
			console.log(job.attrs.data.email);
			var transporter = nodemailer.createTransport({
				service: "gmail",
				secure: false,
				port: 25,
				auth: {
					user: 'peer.exercise@gmail.com',
					pass: 'peer123456'
				},
				tls: {
					rejectUnauthorized: false
				}
			});

			var scheduleMailOptions = {
				from: '"Peer Network" <peer.exercise@gmail.com',
				to: job.attrs.data.email,
				subject: job.attrs.data.subject,
				text: job.attrs.data.content
			};

			transporter.sendMail(scheduleMailOptions, function(err, res) {
				if (err) {
					console.log(err);
				} else {
					console.log("Message Sent:" + res.message);
					transporter.close();
					done();
				}
			});
		});

		res.json({
			message: 'done'
		});
	});

	return api;
};
