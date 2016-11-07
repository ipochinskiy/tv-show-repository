angular.module('MyApp')
  .controller('AddCtrl', ['$scope', '$alert', 'Show', function($scope, $alert, Show) {
    $scope.addShow = () => {
      Show.save({ showName: $scope.showName },
        () => {
          $scope.showName = '';
          $scope.addForm.$setPristine();
          $alert({
            content: 'TV show has been added.',
            placement: 'top-right',
            type: 'success',
            duration: 3
          });
        },
        response => {
          $scope.showName = '';
          $scope.addForm.$setPristine();
          $alert({
            content: response.data,
            placement: 'top-right',
            type: 'danger',
            duration: 3
          });
        });
    };
  }]);
