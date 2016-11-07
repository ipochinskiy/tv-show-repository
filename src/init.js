const path = require('path');

const database = require('./database').initialize();
const serverLib = require('./server');

const auth = require('./auth');
const tasker = require('./tasker');
const responder = require('./responder');
const crypter = require('./utils/crypter');
const tvDbService = require('../services/tv-db-service');

const showModel = require('./models/show-model').initilize({ tvDbService, responder });
const userModel = require('./models/user-model').initialize({ crypter });

const routes = require('./routes').initialize({
    auth,
    tasker,
    showModel,
    userModel,
    responder,
});

const port = process.env.PORT || 3000;
const baseDir = path.join(__dirname, '..');
const publicPath = path.join(baseDir, 'public');

const server = serverLib.initialize({
    auth,
    publicPath,

    // TODO: replace with config property
    env: 'dev',
    sessionSecret: 'keyboard cat',
});

server.useRoutes(routes);
server.start(port);
