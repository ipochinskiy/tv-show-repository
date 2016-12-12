const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

exports.initialize = (userModel) => {
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

	};
};
