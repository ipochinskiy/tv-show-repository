const path = require('path');

const database = require('./database').initialize();
const serverLib = require('./server');

const auth = require('./auth');
const routes = require('./routes');

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
