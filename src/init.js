const path = require('path');

const nodemailer = require('nodemailer');

// TODO: replace with a config property
const dbUrl = 'localhost:27017/test';

const database = require('./database');

const serverLib = require('./server');

const respond = require('./responder');
const crypter = require('./utils/crypter');
const tvDbService = require('./services/tvdb-service');

database.initialize({ dbUrl });

const showModel = require('./models/show-model').initialize({ tvDbService, respond });
const userModel = require('./models/user-model').initialize({ crypter });

const tasker = require('./tasker').initialize({ dbUrl, nodemailer, showModel });

const jwt = require('jwt-simple');

// TODO: get it from config
const sessionSecret = 'keyboard cat';
const AUTH_TOKEN_VALIDITY_PERIOD_SECONDS = 7 * 24 * 60 * 60; // 7 days
const crypto = require('crypto');
const auth = require('./services/auth').initialize(jwt, crypto, userModel, {
	sessionSecret,
	fbSecret: '298fb6c080fda239b809ae418bf49700',		// FIXME: get it from config
	validityPeriod: AUTH_TOKEN_VALIDITY_PERIOD_SECONDS,
});

const { makeAuthController } = require('./controllers/auth-controller');
const { makeShowController } = require('./controllers/show-controller');

const authController = makeAuthController({ auth, userModel });

const sugar = require('sugar');

const getAlertDate = (airsDayOfWeek, airsTime) => {
	const nextAiring = sugar.Date.create(`Next ${airsDayOfWeek} at ${airsTime}`);
	return sugar.Date.rewind(nextAiring, '2 hours');
};
const showController = makeShowController({ showModel, tasker, getAlertDate });

const routes = require('./routes').initialize({
	auth,
	authController,
	showController,
	respond,
});

// TODO: replace with a config property
const port = process.env.PORT || 3000;
const baseDir = path.join(__dirname, '..');
const publicPath = path.join(baseDir, 'public');

const server = serverLib.initialize({
	publicPath,

	// TODO: replace with a config property
	env: 'dev',
});

server.useRoutes(routes);
server.start(port);
