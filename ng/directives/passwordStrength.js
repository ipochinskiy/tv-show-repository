angular.module('MyApp')
	.directive('passwordStrength', function () {
		return {
			restrict: 'A',
			require: 'ngModel',

			link(scope, element, attrs, ngModel) {
				const indicator = element.children();
				const dots = Array.prototype.slice.call(indicator.children());

				const weakest = dots.slice(-1)[0];
				const weak = dots.slice(-2);
				const strong = dots.slice(-3);
				const strongest = dots.slice(-4);

				element.after(indicator);

				element.bind('keyup', () => {
					angular.forEach(dots, (el) => el.style.backgroundColor = '#ebeef1');

					if (ngModel.$modelValue) {
						if (ngModel.$modelValue.length > 8) {
							angular.forEach(strongest, (el) => el.style.backgroundColor = '#008cdd');
						} else if (ngModel.$modelValue.length > 5) {
							angular.forEach(strong, (el) => el.style.backgroundColor = '#6ead09');
						} else if (ngModel.$modelValue.length > 3) {
							angular.forEach(weak, (el) => el.style.backgroundColor = '#e09115');
						} else {
							weakest.style.backgroundColor = '#e01414';
						}
					}
				});
			},
			template: '<span class="password-strength-indicator"><span></span><span></span><span></span><span></span></span>'
		};
	});
