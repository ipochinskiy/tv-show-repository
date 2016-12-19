angular.module('MyApp').controller('SignupCtrl', function ($scope, Auth) {
	$scope.signup = function () {
		Auth.signup({
			name: $scope.fullName,
			email: $scope.email,
			password: $scope.password,
		});
	};

	$scope.pageClass = 'fadeZoom';
});
