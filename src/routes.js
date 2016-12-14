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
			endpoint: '/api/shows',
			method: 'get',
			action: (req, res, next) => {
				showController.getShowsByFilter(req.query.genre, req.query.alphabet)
					.then(result => respond.ok(res, result))
					.catch(err => next(err));
			},
		}, {
			endpoint: '/api/shows/:id',
			method: 'get',
			action: (req, res, next) => {
				showController.getShow(req.params.id)
					.then(result => respond.ok(res, result))
					.catch(err => next(err));
			},
		}, {
			endpoint: '/api/shows',
			method: 'post',
			action: (req, res, next) => {
				const { showName } = req.body;
				showController.addShow(showName)
					.then(() => respond.ok(res))
					.catch(error => {
						if (error[respond.STATUS.NOT_FOUND]) {
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
