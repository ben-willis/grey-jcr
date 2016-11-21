require('dotenv').config();
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: process.env.EMAIL_PORT,
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD
	}
});

var mail = {
	send: function(to, subject, text) {
		var mailOptions = {
			from: "Grey College JCR",
			to: to,
			subject: subject,
			text: text
		}

		transporter.sendMail(mailOptions, function(err, info) {
			if (err) console.err(err)
		})

	}
};

module.exports = mail;