/* eslint-disable prefer-arrow-callback */
angular.module('MyApp').controller('NavbarCtrl', function ($scope, Auth) {
	$scope.logout = function () {
		Auth.logout();
	};
});
/* eslint-enable prefer-arrow-callback */
