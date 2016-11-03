const showModel = require('./models/show-model');

const routes = [
	{
		endpoint: '/api/shows',
		method: 'get',
		action: (req, res, next) => {
			const { genre, alphabet } = req.query;

			return showModel
				.getFilteredShows({ genre, alphabet })
				.then(shows => res.status(200).send(shows))
				.catch(err => next(err));
		},
	}, {
		endpoint: '/api/shows/:id',
		method: 'get',
		action: (req, res, next) => showModel
			.getShow({ id: req.params.id })
			.then(show => res.status(200).send(show))
			.catch(err => next(err)),
	}, {
		endpoint: '/api/shows',
		method: 'post',
		action: (req, res, next) => {
			const seriesName = req.body.showName
				.toLowerCase()
				.replace(/ /g, '_')
				.replace(/[^\w-]+/g, '');

			return showModel
				.addShow({ seriesName })
				.then(() => res.status(200).send())
				.catch(err => {
					if (err.notFound) {
						const message = `${req.body.showName} was not found.`;
						return res.status(404).send({ message });
					} else if (err.alreadyExists) {
						const message = `${req.body.showName} already exists.`;
						return res.status(409).send({ message });
					}

					return next(err);
				});
		},
	}, {
		endpoint: '*',
		method: 'get',
		action: (req, res) => res.redirect(`/#${req.originalUrl}`),
	},
];

module.exports = routes;
