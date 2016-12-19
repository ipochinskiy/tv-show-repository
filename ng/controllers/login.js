angular.module('MyApp').controller('LoginCtrl', function ($scope, Auth) {
	$scope.login = function () {
		Auth.login({
			email: $scope.email,
			password: $scope.password,
		});

		$scope.facebookLogin = Auth.facebookLogin;
	};

	$scope.pageClass = 'fadeZoom';
});
