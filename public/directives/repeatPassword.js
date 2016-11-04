angular.module('MyApp')
	.directive('repeatPassword', function() {
		return {
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				var otherInput = elem.inheritedData("$formController")[attrs.repeatPassword];

				ctrl.$parsers.push(value => {
					if (value === otherInput.$viewValue) {
						ctrl.$setValidity('repeat', true);
						return value;
					}
					ctrl.$setValidity('repeat', false);
				});

				otherInput.$parsers.push(value => {
					ctrl.$setValidity('repeat', value === ctrl.$viewValue);
					return value;
				});
			}
		};
	});
