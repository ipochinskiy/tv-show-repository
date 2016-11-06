const auth = require('./auth');
const tasker = require('./tasker');

const showModel = require('./models/show-model');
const userModel = require('./models/user-model');

const http = {
	STATUS: {
		ALREADY_EXISTS: 409,
		NOT_FOUND: 404,
		OK: 200,
		UNAUTHORIZED: 401,
	},
};

const respond = (code, res, body) => res.status(code).send(body || '');

const httpUtils = {
	respondAlreadyExists: respond.bind(null, http.STATUS.ALREADY_EXISTS),
	respondNotFound: respond.bind(null, http.STATUS.NOT_FOUND),
	respondOk: respond.bind(null, http.STATUS.OK),
	respondUnauthorized: respond.bind(null, http.STATUS.UNAUTHORIZED),
}

const ensureAuthenticated = (req, res, next) => {
	if (auth.isAuthenticated(req)) {
		next();
	} else {
		httpUtils.respondUnauthorized(res);
	}
}

const routes = [
	{
		endpoint: '/api/shows',
		method: 'get',
		action: (req, res, next) => {
			const { genre, alphabet } = req.query;

			return showModel
				.getFilteredShows({ genre, alphabet })
				.then(shows => httpUtils.respondOk(res, shows))
				.catch(err => next(err));
		},
	}, {
		endpoint: '/api/shows/:id',
		method: 'get',
		action: (req, res, next) => showModel
			.getShow({ id: req.params.id })
			.then(show => httpUtils.respondOk(res, show))
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
					httpUtils.respondOk(res);

					// TODO: replace the `sugar` package with custom implementation of the function below
					const alertDate = Date.create(`Next ${show.airsDayOfWeek} at ${show.airsTime}`).rewind({ hour: 2});
					tasker.scheduleJob(alertDate, show);
				})
				.catch(err => {
					if (err.notFound) {
						const message = `${req.body.showName} was not found.`;
						return httpUtils.respondNotFound(res, message);
					} else if (err.alreadyExists) {
						const message = `${req.body.showName} already exists.`;
						return httpUtils.respondAlreadyExists(res, message);
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
			httpUtils.respondOk(res, req.user);
		},
	}, {
		endpoint: '/api/logout',
		method: 'get',
		action: (req, res, next) => {
			req.logout();
			httpUtils.respondOk(res);
		},
	}, {
		endpoint: '/api/signup',
		method: 'post',
		action: (req, res, next) => userModel
			.createUser({
				email: req.body.email,
				password: req.body.password
			})
			.then(() => httpUtils.respondOk(res))
			.catch(err => next(err)),
	}, {
		endpoint: '/api/subscribe',
		method: 'post',
		auth: ensureAuthenticated,
		action: (req, res, next) => showModel.subscribeTo({
				showId: req.body.showId,
				userId: req.user.id,
			})
			.then(() => httpUtils.respondOk(res))
			.catch(err => {
				if (err.notFound) {
					const message = `${req.body.showName} was not found.`;
					return httpUtils.respondNotFound(res, message);
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
			.then(() => httpUtils.respondOk(res))
			.catch(err => {
				if (err.notFound) {
					const message = `${req.body.showName} was not found.`;
					return httpUtils.respondNotFound(res, message);
				}

				return next(err);
			}),
	}, {
		endpoint: '*',
		method: 'get',
		action: (req, res) => res.redirect(`/#${req.originalUrl}`),
	},
];

module.exports = routes;
