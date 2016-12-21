/* eslint-disable prefer-arrow-callback */
angular.module('MyApp').controller(
	'DetailCtrl',
	function ($scope, $rootScope, $routeParams, Show, Subscription) {
		NProgress.start();

		Show.get({ _id: $routeParams.id }, (show) => {
			$scope.show = show;
			NProgress.done();

			$scope.isSubscribed = function () {
				const id = $rootScope.currentUser._id;  // eslint-disable-line no-underscore-dangle
				return $scope.show.subscribers.indexOf(id) !== -1;
			};

			$scope.subscribe = function () {
				return Subscription
					.subscribe(show)
					.success(() => {
						const id = $rootScope.currentUser._id;  // eslint-disable-line no-underscore-dangle
						return $scope.show.subscribers.push(id);
					});
			};

			$scope.unsubscribe = function () {
				return Subscription
					.unsubscribe(show)
					.success(() => {
						const id = $rootScope.currentUser._id;  // eslint-disable-line no-underscore-dangle
						const index = $scope.show.subscribers.indexOf(id);
						$scope.show.subscribers.splice(index, 1);
					});
			};

			$scope.nextEpisode = show.episodes
				.filter(episode => new Date(episode.firstAired) > new Date())[0];
		});
	});
/* eslint-enable prefer-arrow-callback */
