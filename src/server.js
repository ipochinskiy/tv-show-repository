const path = require('path');

const async = require('async');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const request = require('request');
const xml2js = require('xml2js');

const baseDir = path.join(__dirname, '..');
const publicDir = path.join(baseDir, 'public');

const showSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  airsDayOfWeek: String,
  airsTime: String,
  firstAired: Date,
  genre: [String],
  network: String,
  overview: String,
  rating: Number,
  ratingCount: Number,
  status: String,
  poster: String,
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  episodes: [{
    season: Number,
    episodeNumber: Number,
    episodeName: String,
    firstAired: Date,
    overview: String,
  }],
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  return bcrypt.genSalt(10, (err1, salt) => {
    if (err1) {
      return next(err1);
    }

    return bcrypt.hash(this.password, salt, (err2, hash) => {
      if (err2) {
        return next(err2);
      }

      this.password = hash;
      return next();
    });
  });
});

userSchema.methods.comparePassword = (candidatePassword, cb) => {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }

    return cb(null, isMatch);
  });
};

const User = mongoose.model('User', userSchema);
const Show = mongoose.model('Show', showSchema);

mongoose.connect('localhost');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(publicDir));

app.get('/api/shows', (req, res, next) => {
  const query = Show.find();

  if (req.query.genre) {
    query.where({ genre: req.query.genre });
  } else if (req.query.alphabet) {
    query.where({ name: new RegExp(`^[${req.query.alphabet}]`, 'i') });
  } else {
    query.limit(12);
  }

  return query.exec((err, shows) => {
    if (err) {
      return next(err);
    }

    return res.send(shows);
  });
});

app.get('/api/shows/:id', (req, res, next) => Show.findById(
  req.params.id,
  (err, show) => (err ? next(err) : res.send(show)))
);

app.post('/api/shows', (req, res, next) => {
  const apiKey = '9EF1D1E7D28FDA0B';
  const parser = new xml2js.Parser({
    explicitArray: false,
    normalizeTags: true,
  });
  const seriesName = req.body.showName
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '');

  async.waterfall([
    (callback) => request.get(`http://thetvdb.com/api/GetSeries.php?seriesname=${seriesName}`, (error, response, body) => {
      if (error) {
        return next(error);
      }

      return parser.parseString(body, (err, result) => {
        if (!result.data.series) {
          return res.send(404, { message: `${req.body.showName} was not found.` });
        }

        const seriesId = result.data.series.seriesid || result.data.series[0].seriesid;
        return callback(err, seriesId);
      });
    }),
    (seriesId, callback) => request.get(`http://thetvdb.com/api/${apiKey}/series/${seriesId}/all/en.xml`, (error, response, body) => {
      if (error) {
        return next(error);
      }

      parser.parseString(body, (err, result) => {
        const series = result.data.series;
        const episodes = result.data.episode;
        const show = new Show({
          _id: series.id,
          name: series.seriesname,
          airsDayOfWeek: series.airs_dayofweek,
          airsTime: series.airs_time,
          firstAired: series.firstaired,
          genre: series.genre.split('|').filter(Boolean),

          network: series.network,
          overview: series.overview,
          rating: series.rating,
          ratingCount: series.ratingcount,
          runtime: series.runtime,
          status: series.status,
          poster: series.poster,
          episodes: [],
        });
        episodes.forEach(episode => {
          show.episodes.push({
            season: episode.seasonnumber,
            episodeNumber: episode.episodenumber,
            episodeName: episode.episodename,
            firstAired: episode.firstaired,
            overview: episode.overview,
          });
        });
        return callback(err, show);
      });
    }),
    (show, callback) => {
      const url = `http://thetvdb.com/banners/${show.poster}`;
      request({ url, encoding: null }, (error, response, body) => {
        const poster = `data:${response.headers['content-type']};base64,${body.toString('base64')}`;
        callback(error, Object.assign({}, show, { poster }));
      });
    },
  ], (err1, show) => {
    if (err1) {
      return next(err1);
    }

    return show.save((err2) => {
      if (err2) {
        if (err2.code === 11000) {
          return res.send(409, { message: `${show.name} already exists.` });
        }
        return next(err2);
      }
      res.send(200);
    });
  });
});

app.get('*', (req, res) => res.redirect(`/#${req.originalUrl}`));

app.use((err, req, res) => {
  console.error(err.stack);
  res.send(500, { message: err.message });
});

app.listen(
  app.get('port'),
  () => console.log(`Express server listening on port ${app.get('port')}`)
);
