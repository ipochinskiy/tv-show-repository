/* eslint-disable no-underscore-dangle */
angular.module('MyApp')
	.factory('Subscription', ['$http', function initMyAppFactory($http) {
		return {
			// subscribe: function(show, user) {
			subscribe(show) {
				$http.post('/api/subscribe', { showId: show._id });
			},
			// unsubscribe: function(show, user) {
			unsubscribe(show) {
				$http.post('/api/unsubscribe', { showId: show._id });
			},
		};
	}]);
/* eslint-enable no-underscore-dangle */
