const path = require('path');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');

const routes = require('./routes');

const baseDir = path.join(__dirname, '..');
const publicDir = path.join(baseDir, 'public');

mongoose.connect('localhost');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(publicDir));

routes.forEach(route =>
  app[route.method](route.endpoint, route.action));

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send({ message: err.message });
});

app.listen(
  app.get('port'),
  () => console.log(`Express server listening on port ${app.get('port')}`)
);
