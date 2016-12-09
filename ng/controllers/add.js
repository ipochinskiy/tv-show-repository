angular.module('MyApp').controller('AddCtrl', function ($scope, $alert, Show) {
	$scope.addShow = function () {
		Show.save({ showName: $scope.showName },
			() => {
				$scope.showName = '';
				$scope.addForm.$setPristine();
				$alert({
					animation: 'fadeZoomFadeDown',
					content: 'TV show has been added.',
					type: 'material',
					duration: 3,
				});
			},
			(response) => {
				$scope.showName = '';
				$scope.addForm.$setPristine();
				$alert({
					animation: 'fadeZoomFadeDown',
					content: response.data,
					type: 'material',
					duration: 3,
				});
			}
		);
	};
});
