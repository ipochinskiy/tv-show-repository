const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

exports.initialize = (userModel) => {
	passport.serializeUser((user, done) => done(null, user.id));

	passport.deserializeUser((id, done) => userModel.findOne({ id })
		.then(user => done(null, user))
		.catch(err => done(err)));

	passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
		userModel.findOne({ email, password })
			.then(user => done(null, user || false))
			.catch(err => done(err))
	}));

	return {
		initialize(...args) {
			return passport.initialize.call(passport, ...args);
		},
		session(...args) {
			return passport.session.call(passport, ...args);
		},

		authenticate: passport.authenticate('local'),

		isAuthenticated: req => req.isAuthenticated(req),
	};
}
