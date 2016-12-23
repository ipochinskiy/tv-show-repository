/* eslint-disable prefer-arrow-callback */
angular.module('MyApp').controller('LoginCtrl', function ($scope, Auth) {
	$scope.login = function () {
		Auth.login({
			email: $scope.email,
			password: $scope.password,
		});

		$scope.facebookLogin = Auth.facebookLogin;
		$scope.googleLogin = Auth.googleLogin;
	};

	$scope.pageClass = 'fadeZoom';
});
/* eslint-enable prefer-arrow-callback */
