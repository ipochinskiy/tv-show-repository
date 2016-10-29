const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const baseDir = path.join(__dirname, '..');
const publicDir = path.join(baseDir, 'public');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(publicDir));

app.listen(
  app.get('port'),
  () => console.log(`Express server listening on port ${app.get('port')}`)
);
