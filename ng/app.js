angular.module('MyApp', ['ngResource', 'ngMessages', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap'])
	.config(function ($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true);

		$routeProvider
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainCtrl',
		})
		.when('/shows/:id', {
			templateUrl: 'views/detail.html',
			controller: 'DetailCtrl',
		})
		.when('/login', {
			templateUrl: 'views/login.html',
			controller: 'LoginCtrl',
		})
		.when('/signup', {
			templateUrl: 'views/signup.html',
			controller: 'SignupCtrl',
		})
		.when('/add', {
			templateUrl: 'views/add.html',
			controller: 'AddCtrl',
		})
		.otherwise({
			redirectTo: '/',
		});
	})
	.config(function ($httpProvider) {
		$httpProvider.interceptors.push(($rootScope, $q, $window, $location) => ({
			request(config) {
				if ($window.localStorage.token) {
					config.headers.Authorization = `Bearer ${$window.localStorage.token}`;
				}
				return config;
			},
			responseError(response) {
				if (response.status === 401 || response.status === 403) {
					$location.path('/login');
				}
				return $q.reject(response);
			},
		});
	})
	.run(function($rootScope, $location) {

	});
