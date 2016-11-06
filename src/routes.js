exports.initialize = function ({ auth, tasker, showModel, userModel, responder }) {
	const ensureAuthenticated = (req, res, next) => {
		if (auth.isAuthenticated(req)) {
			next();
		} else {
			responder.unauthorized(res);
		}
	}

	return [
		{
			endpoint: '/api/shows',
			method: 'get',
			action: (req, res, next) => showModel
				.getFilteredShows({
					genre: req.query.genre,
					alphabet: req.query.alphabet
				})
				.then(shows => responder.ok(res, shows))
				.catch(err => next(err)),
		}, {
			endpoint: '/api/shows/:id',
			method: 'get',
			action: (req, res, next) => showModel
				.getShow({ id: req.params.id })
				.then(show => responder.ok(res, show))
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
					.then(show => {
						responder.ok(res);

						// TODO: replace the `sugar` package with custom implementation of the function below
						const alertDate = Date.create(`Next ${show.airsDayOfWeek} at ${show.airsTime}`).rewind({ hour: 2});
						tasker.scheduleJob(alertDate, show);
					})
					.catch(err => {
						if (err.notFound) {
							const message = `${req.body.showName} was not found.`;
							return responder.notFound(res, message);
						} else if (err.alreadyExists) {
							const message = `${req.body.showName} already exists.`;
							return responder.alreadyExists(res, message);
						}

						return next(err);
					});
			},
		}, {
			endpoint: '/api/login',
			method: 'post',
			auth: auth.authenticate,
			action: (req, res, next) => {
				// TODO: replace the user with something more secure
				res.cookie('user', JSON.stringify(req.user));
				responder.ok(res, req.user);
			},
		}, {
			endpoint: '/api/logout',
			method: 'get',
			action: (req, res, next) => {
				req.logout();
				responder.ok(res);
			},
		}, {
			endpoint: '/api/signup',
			method: 'post',
			action: (req, res, next) => userModel
				.createUser({
					email: req.body.email,
					password: req.body.password
				})
				.then(() => responder.ok(res))
				.catch(err => next(err)),
		}, {
			endpoint: '/api/subscribe',
			method: 'post',
			auth: ensureAuthenticated,
			action: (req, res, next) => showModel.subscribeTo({
					showId: req.body.showId,
					userId: req.user.id,
				})
				.then(() => responder.ok(res))
				.catch(err => {
					if (err.notFound) {
						const message = `${req.body.showName} was not found.`;
						return responder.notFound(res, message);
					}

					return next(err);
				}),
		}, {
			endpoint: '/api/unsubscribe',
			method: 'post',
			auth: ensureAuthenticated,
			action: (req, res, next) => showModel.unsubscribeFrom({
					showId: req.body.showId,
					userId: req.user.id,
				})
				.then(() => responder.ok(res))
				.catch(err => {
					if (err.notFound) {
						const message = `${req.body.showName} was not found.`;
						return responder.notFound(res, message);
					}

					return next(err);
				}),
		}, {
			endpoint: '*',
			method: 'get',
			action: (req, res) => res.redirect(`/#${req.originalUrl}`),
		},
	];
}
