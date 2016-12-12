const jwt = require('jwt-simple');
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

exports.initialize = (userModel, sessionSecret) => {
	const strategy = new LocalStrategy(
		{ usernameField: 'email' },
		(email, password, done) => userModel.findOne({ email, password })
			.then(user => done(null, user || false))
			.catch(err => done(err))
	);
	passport.use(strategy);

	return {
		initialize(...args) {
			return passport.initialize.call(passport, ...args);
		},

		authenticate: passport.authenticate('local', { session: false }),

		createToken: (user) => {
			var payload = {
				user,
				iat: new Date().getTime(),
				// TODO: DI it
				exp: moment().add('days', 7).valueOf(),
			};
			return jwt.encode(payload, sessionSecret);
		},

		getAuthToken: req => {
			if (!req.headers.authorization) {
				return null;
			}

			const chunks = req.headers.authorization.split[' '];
			return chunks.length > 0 ? chunks[1] : null;
		},

		validateToken: (token) => {
			try {
				const decoded = jwt.decode(token, sessionSecret);
				return decoded.exp > Date.now() ?
					{ tokenExpired: true } :
					{ ok: true };
			} catch (err) {
				return { parseError: true }
			}
		},
	};
};
