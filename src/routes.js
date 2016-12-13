const sugar = require('sugar');

exports.initialize = ({ auth, tasker, showModel, authController, respond }) => {
	const ensureAuthenticated = (req, res, next) => {
		const token = auth.getAuthToken(req);
		if (!token) {
			return respond.unauthorized(res);
		}

		const { decodedToken, tokenExpired } = auth.validateToken(token);

		if (decodedToken) {
			// TODO: change it!
			req.user = decodedToken.user;
			return next();
		}

		if (tokenExpired) {
			return respond.tokenExpired(res);
		}

		return respond.internalError(res);
	};

	return [
		{
			endpoint: '/api/shows',
			method: 'get',
			action: (req, res, next) => showModel
				.getFilteredShows({
					genre: req.query.genre,
					alphabet: req.query.alphabet,
				})
				.then(shows => respond.ok(res, shows))
				.catch(err => next(err)),
		}, {
			endpoint: '/api/shows/:id',
			method: 'get',
			action: (req, res, next) => showModel
				.getShow({ id: req.params.id })
				.then(show => respond.ok(res, show))
				.catch(err => next(err)),
		}, {
			endpoint: '/api/shows',
			method: 'post',
			action: (req, res, next) => {
				const seriesName = req.body.showName
					.toLowerCase()
					.replace(/ /g, '_')
					.replace(/[^\w-]+/g, '');

				// FIXME: by adding a show `am` or `ame` a buffer is shown to a user
				return showModel.addShow({ seriesName })
					.then(show => {
						respond.ok(res);

						if (!showModel.isShowEnded(show)) {
							const message = `Next ${show.airsDayOfWeek} at ${show.airsTime}`;
							const nextAiring = sugar.Date.create(message);
							const alertDate = sugar.Date.rewind(nextAiring, '2 hours');
							tasker.scheduleJob(alertDate, show);
						}

						return Promise.resolve({});
					})
					.catch(err => {
						if (err[respond.STATUS.NOT_FOUND]) {
							const message = `${req.body.showName} was not found.`;
							return respond.notFound(res, message);
						} else if (err[respond.STATUS.ALREADY_EXISTS]) {
							const message = `${req.body.showName} already exists.`;
							return respond.alreadyExists(res, message);
						}

						return next(err);
					});
			},
		}, {
			endpoint: '/auth/login',
			method: 'post',
			action: (req, res) => authController.login(req, res),
		}, {
			endpoint: '/auth/logout',
			method: 'get',
			action: (req, res) => authController.logout(req, res),
		}, {
			endpoint: '/auth/signup',
			method: 'post',
			action: (req, res, next) => {
				authController.signup(req.body.email, req.body.password)
				.then(() => respond.ok(res))
					.catch(err => next(err));
			},
		}, {
			endpoint: '/api/subscribe',
			method: 'post',
			auth: ensureAuthenticated,
			action: (req, res, next) => showModel.subscribeTo({
				showId: req.body.showId,
				userId: req.user.id,
			})
			.then(() => respond.ok(res))
			.catch(err => {
				if (err.notFound) {
					const message = `${req.body.showName} was not found.`;
					return respond.notFound(res, message);
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
			.then(() => respond.ok(res))
			.catch(err => {
				if (err.notFound) {
					const message = `${req.body.showName} was not found.`;
					return respond.notFound(res, message);
				}

				return next(err);
			}),
		}, {
			endpoint: '*',
			method: 'get',
			action: (req, res) => res.redirect(`/#${req.originalUrl}`),
		},
	];
};
