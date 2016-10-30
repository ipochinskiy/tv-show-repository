angular.module('MyApp')
  .factory('Show', [ '$resource', ($resource) => {
    return $resource('/api/shows/:_id');
  } ]);
  