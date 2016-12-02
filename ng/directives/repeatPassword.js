angular.module('MyApp')
	.directive('repeatPassword', () => ({
		require: 'ngModel',
		link(scope, elem, attrs, ctrl) {
			const otherInput = elem.inheritedData('$formController')[attrs.repeatPassword];

			ctrl.$parsers.push((value) => {
				if (value === otherInput.$viewValue) {
					ctrl.$setValidity('repeat', true);
					return value;
				}
				return ctrl.$setValidity('repeat', false);
			});

			return otherInput.$parsers.push((value) => {
				ctrl.$setValidity('repeat', value === ctrl.$viewValue);
				return value;
			});
		},
	}));
