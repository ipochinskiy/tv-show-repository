const async = require('async');
const request = require('request');
const xml2js = require('xml2js');

const Show = require('./schema/show-scheme');

const routes = [
  {
    endpoint: '/api/shows',
    method: 'get',
    action: (req, res, next) => {
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
    },
  }, {
    endpoint: '/api/shows/:id',
    method: 'get',
    action: (req, res, next) => Show.findById(req.params.id, (err, show) => {
      if (err) {
        return next(err);
      }
      const result = Object.assign({}, show._doc, { poster: `http://thetvdb.com/banners/${show.poster}` });
      return res.send(result);
    }),
  }, {
    endpoint: '/api/shows',
    method: 'post',
    action: (req, res, next) => {
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
              return res.status(404).send({ message: `${req.body.showName} was not found.` });
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
              return res.status(409).send({ message: `${show.name} already exists.` });
            }
            return next(err2);
          }
          return res.status(200).send();
        });
      });
    },
  }, {
    endpoint: '*',
    method: 'get',
    action: (req, res) => res.redirect(`/#${req.originalUrl}`),
  },
];

module.exports = routes;
