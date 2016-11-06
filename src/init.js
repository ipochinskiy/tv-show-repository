const path = require('path');

const database = require('./database').initialize();
const serverLib = require('./server');

const auth = require('./auth');
const tasker = require('./tasker');
const responder = require('./responder');
const showModel = require('./models/show-model');
const userModel = require('./models/user-model');

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
