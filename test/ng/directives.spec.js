describe('directives', () => {
	beforeEach(module('MyApp'));

	describe('passwordStrength', () => {
		it('should print current version', inject(($compile, $rootScope) => {
			const expectedContent = '<span></span><span></span><span></span><span></span>';
			const element = angular.element('<input password-strength class="form-control input-lg" type="password" name="password" ng-model="password" placeholder="Password required">');

			$compile(element)($rootScope);

			expect(element.next().html()).toBe(expectedContent);
		}));
	});
});
