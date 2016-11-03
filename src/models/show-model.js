const Show = require('../schema/show-scheme');
const tvDbService = require('../services/tv-db-service');

exports.getFilteredShows = function ({ genre, alphabet, limit = 12 }) {
	const query = Show.find();

	if (genre) {
		query.where({ genre });
	} else if (alphabet) {
		query.where({ name: new RegExp(`^[${alphabet}]`, 'i') });
	} else {
		query.limit(limit);
	}

	return query.exec();
};

exports.getShow = ({ id }) => Show.findById(id).exec().then(show => show && show._doc);

exports.addShow = ({ seriesName }, req, res, next) => tvDbService
	.searchSeriesByName({ seriesName })
	.then(result => {
		const series = result && result.data && result.data.series;

		if (!series) {
			throw { notFound: true };
		}

		return Array.isArray(series)
		// FIXME: if a series has no poster, a request to banners endpoint
		//        will return 403 with unfriendly message (i.g. "wow")
			? series[0].seriesid
			: series.seriesid;
	}).then(seriesId => {
		return tvDbService.getSeriesInfo({ seriesId });
	}).then(result => {
		const data = result && result.data;
		const series = data.series;
		const episodes = [].concat(data.episode);

		if (!series) {
			throw { tvdbError: true };
		}

		return new Show({
			_id: series.id,
			name: series.seriesname,
			airsDayOfWeek: series.airs_dayofweek,
			airsTime: series.airs_time,
			firstAired: series.firstaired,
			genre: series.genre.split('|').filter(chunk => !!chunk),

			network: series.network,
			overview: series.overview,
			rating: series.rating,
			ratingCount: series.ratingcount,
			runtime: series.runtime,
			status: series.status,
			poster: series.poster,
			episodes: episodes.map(episode => ({
				season: episode.seasonnumber,
				episodeNumber: episode.episodenumber,
				episodeName: episode.episodename,
				firstAired: episode.firstaired,
				overview: episode.overview,
			})),
		});
	}).then(show => {
		return tvDbService.loadPoster({ poster: show.poster })
			.then(posterString => {
				const res = Object.assign({}, show, { poster: posterString });
				return res;
			});
	}).then(show => {
		console.log('show.poster:', show.poster.slice(0, 200));
		return new Promise((resolve, reject) => {
			show.save(err => {
				if (err) {
					reject(err.code === 11000
						? { alreadyExists: true }
						: err);
				}
				resolve(show);
			});
		});
	});
