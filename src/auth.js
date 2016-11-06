const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const userModel = require('./models/user-model');

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => userModel.findOne({ id })
    .then(user => done(null, user))
    .catch(err => done(err)));

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) =>
    userModel.findOne({ email, password })
        .then(user => done(null, user || false))
        .catch(err => done(err))
));

module.exports = {
    initialize: function() {
        return passport.initialize.apply(passport, arguments);
    },
    session: function() {
        return passport.session.apply(passport, arguments);
    },
    authenticate: passport.authenticate('local'),
};
