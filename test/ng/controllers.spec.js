describe('controllers', () => {
	beforeEach(module('MyApp'));

	describe('AddCtrl', () => {
		it('should be defined', inject(($controller) => {
			const addCtrl = $controller('AddCtrl', { $scope: {} });
			expect(addCtrl).toBeDefined();
		}));
	});

	describe('DetailCtrl', () => {
		it('should be defined', inject(($controller) => {
			const detailCtrl = $controller('DetailCtrl', { $scope: {} });
			expect(detailCtrl).toBeDefined();
		}));
	});
});
