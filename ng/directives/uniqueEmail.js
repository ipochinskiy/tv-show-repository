angular.module('MyApp')
	.directive('uniqueEmail', function ($http) {
		return {
			restrict: 'A',
			require: 'ngModel',

			link(scope, element, attrs, ngModel) {
				element.bind('blur', () => {
					if (ngModel.$modelValue) {
						$http.get('/api/users', {
							params: {
								email: ngModel.$modelValue,
							},
						}).success((data) ngModel.$setValidity('unique', data.available));
					}
				});

				element.bind('keyup', () => ngModel.$setValidity('unique', true));
			}
		};
	});
