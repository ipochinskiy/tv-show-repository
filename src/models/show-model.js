const Show = require('../schema/show-scheme');

exports.initialize = function ({ tvDbService, respond }) {
	return {
		getFilteredShows: function ({ genre, alphabet, limit = 12 }) {
			const query = Show.find();

			if (genre) {
				query.where({ genre });
			} else if (alphabet) {
				query.where({ name: new RegExp(`^[${alphabet}]`, 'i') });
			} else {
				query.limit(limit);
			}

			return query.exec();
		},

		getShow: ({ id }) => Show.findById(id).exec().then(show => show && show._doc),

		findOnePopulateSubscribers: ({ name }) => Show.findOne({ name }).populate('subscribers').exec(),

		addShow: ({ seriesName }) => tvDbService
			.searchSeriesByName({ seriesName })
			.then(result => {
				const series = result && result.data && result.data.series;

				if (!series) {
					// const err = { notFound: true };
					// throw err;
					throw respond.createHttpError(respond.STATUS.NOT_FOUND);
				}

				return Array.isArray(series)
				// FIXME: if a series has no poster, a request to banners endpoint
				//        will return 403 with unfriendly message (i.g. "wow")
					? series[0].seriesid
					: series.seriesid;
			})
			.then(seriesId => tvDbService.getSeriesInfo({ seriesId }))
			.then(result => {
				const data = result && result.data;
				const series = data.series;
				const episodes = [].concat(data.episode);

				if (!series) {
					const err = { tvdbError: true };
					throw err;
					// throw respond.createHttpError(respond.STATUS.NOT_FOUND);
				}

				const show = {
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
					posterLink: series.poster,
					episodes: episodes.map(episode => ({
						season: episode.seasonnumber,
						episodeNumber: episode.episodenumber,
						episodeName: episode.episodename,
						firstAired: episode.firstaired,
						overview: episode.overview,
					})),
				};

				return tvDbService.loadPoster({ poster: show.posterLink })
					.then(posterData => {
						// TODO: save this data into a local file
						show.posterData = posterData;
						return new Show(show);
					});
			})
			.then(show => new Promise((resolve, reject) => {
				show.save(err => {
					if (err) {
						reject(err.code === 11000
							// ? { alreadyExists: true }
							? respond.createHttpError(respond.STATUS.ALREADY_EXISTS)
							: err);
					}
					resolve(show);
				});
			})),

		subscribeTo: ({ showId, userId }) => Show.findById(showId).exec()
			.then(show => {
				if (!show) {
					// const err = { notFound: true };
					// throw err;
					throw respond.createHttpError(respond.STATUS.NOT_FOUND);
				}

				const alreadySubscribed = show.subscribers
					.filter(id => id === userId).length > 0;

				if (!alreadySubscribed) {
					show.subscribers.push(userId);
				}

				return show.save();
			}),

		unsubscribeFrom: ({ showId, userId }) => Show.findById(showId).exec()
			.then(show => {
				if (!show) {
					// const err = { notFound: true };
					// throw err;
					throw respond.createHttpError(respond.STATUS.NOT_FOUND);
				}

				const userIndex = show.subscribers.indexOf(userId);
				if (userIndex > -1) {
					show.subscribers.splice(userIndex, 1);
				}

				return show.save();
			}),
	}
}
