const path = require('path');

const nodemailer = require('nodemailer');

// TODO: replace with a config property
const dbUrl = 'localhost:27017/test';

const database = require('./database');

const serverLib = require('./server');

const respond = require('./responder');
const crypter = require('./utils/crypter');
const tvDbService = require('./services/tv-db-service');

database.initialize({ dbUrl });

const showModel = require('./models/show-model').initialize({ tvDbService, respond });
const userModel = require('./models/user-model').initialize({ crypter });

const tasker = require('./tasker').initialize({ dbUrl, nodemailer, showModel });

// TODO: get it from config
const sessionSecret = 'keyboard cat';
const getAuthTokenExpiryDate = () => moment().add('days', 7).valueOf();
const auth = require('./auth').initialize(userModel, sessionSecret, getAuthTokenExpiryDate);

const routes = require('./routes').initialize({
	auth,
	tasker,
	showModel,
	userModel,
	respond,
});

// TODO: replace with a config property
const port = process.env.PORT || 3000;
const baseDir = path.join(__dirname, '..');
const publicPath = path.join(baseDir, 'public');

const server = serverLib.initialize({
	auth,
	publicPath,

	// TODO: replace with a config property
	env: 'dev',
});

server.useRoutes(routes);
server.start(port);
