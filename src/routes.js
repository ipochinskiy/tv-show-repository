exports.initialize = ({ auth, authController, showController, userModel, respond }) => {
	// split and partly move to controller
	const ensureAuthenticated = (req, res, next) => {
		const token = auth.getAuthToken(req.headers);
		if (!token) {
			return respond.unauthorized(res);
		}

		const { decodedToken, tokenExpired } = auth.validateToken(token);

		if (decodedToken) {
			// TODO: change it!
			req.user = decodedToken.user; // eslint-disable-line no-param-reassign
			return next();
		}

		if (tokenExpired) {
			return respond.badRequest(res, 'Access token has expired');
		}

		return respond.internalError(res);
	};

	// TODO: my profile route:
	// https://github.com/sahat/tvshow-tracker/commit/caf1b9a2d331ee3d279e22f547abcc74b48562f6#diff-78c12f5adc1848d13b1c6f07055d996eR133
	return [
		{
			endpoint: '/auth/login',
			method: 'post',
			action: (req, res) => authController.login(req.body.email, req.body.password)
				.then((token) => {
					if (!token) {
						return respond.unauthorized(res);
					}
					return respond.ok({ token });
				}),
		}, {
			endpoint: '/auth/signup',
			method: 'post',
			action: (req, res, next) => authController.signup(req.body.name, req.body.email, req.body.password)
				.then(() => respond.ok(res))
				.catch(err => next(err)),
		}, {
			endpoint: '/auth/facebook',
			method: 'post',
			action: (req, res, next) => {
				const { profile, signedRequest } = req.body;
				const [ signature, payload ] = signedRequest.split('.');

				return authController.fb(profile, signature, payload)
					.then((token) => respond.ok({ token }))
					.catch((error) => {
						if (error.invalidSignature) {
							return respond.badRequest('Invalid signature');
						}
						return next(error);
					});
			},
		}, {
			endpoint: '/api/users',
			method: 'get',
			action: (req, res, next) => {
				const { email } = req.query;

				if (!email) {
					return respond.badRequest('Email parameter is required.');
				}

				userModel.findOne({ email })
					.then((user) => respond.ok(res, JSON.stringify({ available: !user })))
					.catch(err => next(err));
			},
		}, {
			endpoint: '/api/shows',
			method: 'get',
			action: (req, res, next) => showController
				.getShowsByFilter(req.query.genre, req.query.alphabet)
				.then(result => respond.ok(res, result))
				.catch(err => next(err)),
		}, {
			endpoint: '/api/shows/:id',
			method: 'get',
			action: (req, res, next) => showController.getShow(req.params.id)
				.then(result => respond.ok(res, result))
				.catch(err => next(err)),
		}, {
			endpoint: '/api/shows',
			method: 'post',
			action: (req, res, next) => {
				const { showName } = req.body;

				return showController.addShow(showName)
					.then(() => respond.ok(res))
					.catch(error => {
						if (error[respond.STATUS.BAD_REQUEST]) {
							return respond.notFound(res, `${showName} was not found.`);
						} else if (error[respond.STATUS.ALREADY_EXISTS]) {
							return respond.alreadyExists(res, `${showName} already exists.`);
						}

						return next(error);
					});
			},
		}, {
			endpoint: '/api/subscribe',
			method: 'post',
			auth: ensureAuthenticated,
			action: (req, res, next) => {
				const { showId, showName, id: userId } = req.body; // *._id ?

				return showController.subscribe(showId, userId)
					.then(() => respond.ok(res))
					.catch(error => {
						if (error.notFound) {
							return respond.notFound(res, `${showName} was not found.`);
						}

						return next(error);
					});
			},
		}, {
			endpoint: '/api/unsubscribe',
			method: 'post',
			auth: ensureAuthenticated,
			action: (req, res, next) => {
				const { showId, showName, id: userId } = req.body; // *._id ?

				return showController.subscribe(showId, userId)
					.then(() => respond.ok(res))
					.catch(error => {
						if (error.notFound) {
							return respond.notFound(res, `${showName} was not found.`);
						}

						return next(error);
					});
			},
		}, {
			endpoint: '*',
			method: 'get',
			action: (req, res) => res.redirect(`/#${req.originalUrl}`),
		},
	];
};
