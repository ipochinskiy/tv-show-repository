angular.module('MyApp').
  filter('fromNow', () => date => moment(date).fromNow());
