angular.module('MyApp')
  .factory('Subscription', ['$http', $http => ({
    subscribe: (show, user) => 
      $http.post('/api/subscribe', { showId: show._id }),
    unsubscribe: (show, user) => 
      $http.post('/api/unsubscribe', { showId: show._id })
  })]);
