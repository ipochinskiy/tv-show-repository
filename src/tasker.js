const agenda = require('agenda')({
	db: { address: 'localhost:27017/test' },
});
const sugar = require('sugar');
const nodemailer = require('nodemailer');

const getMailText = (show, upcoming) => `
${show.name} starts in less than 2 hours on ${show.network}.

Episode ${upcoming.episodeNumber} Overview

${upcoming.overview}
`;

agenda.define('send email alert', (job, done) => {
  Show.findOne({ name: job.attrs.data }).populate('subscribers').exec()
  	.then(show => {
	    const emails = show.subscribers.map(user => user.email);

	    const upcomingEpisode = show.episodes.filter(episode =>
			new Date(episode.firstAired) > new Date())[0];

		// TODO: replace with config properties
	    const smtpTransport = nodemailer.createTransport('SMTP', {
			service: 'SendGrid',
			auth: { user: 'hslogin', pass: 'hspassword00' }
	    });

		// TODO: replace with config properties
	    const mailOptions = {
			from: 'Fred Foo ✔ <foo@blurdybloop.com>',
			to: emails.join(','),
			subject: `${show.name} is starting soon!`,
			text: getMailText(show, upcomingEpisode)
	    };

		smtpTransport.sendMail(mailOptions, (error, response) => {
			console.log(`Message sent: ${response.message}`);
			smtpTransport.close();
			done();
		});
	});
});

agenda.start();

agenda.on('start', job => console.log("Job %s starting", job.attrs.name));

agenda.on('complete', job => console.log("Job %s finished", job.attrs.name));

// TODO: job name as a parameter
exports.scheduleJob = (alertDate, show) => {
    return agenda.schedule(alertDate, 'send email alert', show.name).repeatEvery('1 week');
}
