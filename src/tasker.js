const getMailText = (show, upcoming) => `
${show.name} starts in less than 2 hours on ${show.network}.

Episode ${upcoming.episodeNumber} Overview

${upcoming.overview}
`;

const jobNames = {
	nextAiring: 'send next airing notification',
}

exports.initialize = ({ dbUrl, nodemailer, showModel }) => {
	const agenda = require('agenda')({
		db: { address: dbUrl },
	});

	agenda.define(jobNames.nextAiring, (job, done) => showModel.findOnePopulateSubscribers({ name: job.attrs.data })
	  	.then(show => {
			if (showModel.isShowEnded(show)) {
				agenda.cancel({ name: jobNames.nextAiring, data: show.name }, done);
			}

		    const emails = show.subscribers.map(user => user.email);

		    const upcomingEpisode = show.episodes.filter(episode =>
				new Date(episode.firstAired) > new Date())[0];

			if (!upcomingEpisode) {
				return Promise.resolve(done());
			}

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
				return Promise.resolve(done());
			});
		}));


	agenda.on('start', job => console.log("Job %s starting", job.attrs.name));

	agenda.on('complete', job => console.log("Job %s finished", job.attrs.name));

	agenda.on('ready', function() {
		agenda.start();
	});

	return {
		// TODO: job name as a parameter
		scheduleJob: (alertDate, show) => {
		    return agenda.schedule(alertDate, jobNames.nextAiring, show.name).repeatEvery('1 week');
		}
	};
}
