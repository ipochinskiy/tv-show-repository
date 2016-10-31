angular.module('MyApp')
  .controller('DetailCtrl', ['$scope', '$rootScope', '$routeParams', 'Show', 'Subscription',
    function($scope, $rootScope, $routeParams, Show, Subscription) {
      Show.get({ _id: $routeParams.id }, show => {
        $scope.show = show;

        $scope.isSubscribed = () =>
          $scope.show.subscribers.indexOf($rootScope.currentUser._id) !== -1;

        $scope.subscribe = () => Subscription
          .subscribe(show)
          .success(() => $scope.show.subscribers.push($rootScope.currentUser._id));

        $scope.unsubscribe = () => Subscription
          .unsubscribe(show)
          .success(() => {
            var index = $scope.show.subscribers.indexOf($rootScope.currentUser._id);
            $scope.show.subscribers.splice(index, 1);
          });

        $scope.nextEpisode = show.episodes
          .filter(episode => new Date(episode.firstAired) > new Date())[0];
      });
    }]);
