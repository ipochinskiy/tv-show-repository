angular.module('MyApp')
  .factory('Subscription', ['$http', function($http) {
      return {
        subscribe: function(show, user) {
            $http.post('/api/subscribe', { showId: show._id });
        },
        unsubscribe: function(show, user) {
            $http.post('/api/unsubscribe', { showId: show._id });
        }
      };
  }]);
