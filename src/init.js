const path = require('path');

const nodemailer = require('nodemailer');

// TODO: replace with a config property
const dbUrl = 'localhost:27017/test';

const database = require('./database').initialize({ dbUrl });
const serverLib = require('./server');

const auth = require('./auth');
const respond = require('./responder');
const crypter = require('./utils/crypter');
const tvDbService = require('./services/tv-db-service');

const showModel = require('./models/show-model').initialize({ tvDbService, respond });
const userModel = require('./models/user-model').initialize({ crypter });

const tasker = require('./tasker').initialize({ dbUrl, nodemailer, showModel });

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
    sessionSecret: 'keyboard cat',
});

server.useRoutes(routes);
server.start(port);
