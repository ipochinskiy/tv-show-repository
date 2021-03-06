 /* eslint-disable arrow-body-style */
exports.makeShowController = ({ showModel, tasker, getAlertDate }) => {
	return {
		getShowsByFilter: (genre, alphabet) => showModel.getFilteredShows({ genre, alphabet }),

		getShow: (id) => showModel.getShow({ id }),

		addShow: (showName) => {
			const seriesName = showName
				.toLowerCase()
				.replace(/ /g, '_')
				.replace(/[^\w-]+/g, '');

			// FIXME: by adding a show `am` or `ame` a buffer is shown to a user
			return showModel.addShow({ seriesName })
				.then(show => {
					if (!showModel.isShowEnded(show)) {
						const alertDate = getAlertDate(show.airsDayOfWeek, show.airsTime);
						tasker.scheduleJob(alertDate, show);
					}

					return Promise.resolve();
				});
		},

		subscribe: (showId, userId) => showModel.subscribeTo({ showId, userId }),

		unsubscribe: (showId, userId) => showModel.unsubscribeFrom({ showId, userId }),
	};
};
