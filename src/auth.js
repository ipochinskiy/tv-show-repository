const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./schema/user-scheme');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
	User.findById(id, (err, user) => done(err, user)));

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
	User.findOne({ email: email }, (err, user) => {
		if (err) {
			return done(err);
		}
		if (!user) {
			return done(null, false);
		}
		user.comparePassword(password, (err, isMatch) => {
			if (err) {
				return done(err);
			}
			if (isMatch) {
				return done(null, user);
			}
			return done(null, false);
		});
	});
}));

module.exports = {
    initialize: function() {
        return passport.initialize.apply(passport, arguments);
    },
    session: function() {
        return passport.session.apply(passport, arguments);
    },
    authenticate: passport.authenticate('local'),
};
