describe('filters', () => {
	beforeEach(module('MyApp'));

	describe('fromNow', () => {
		it('should display a relative date string', inject((fromNowFilter) => {
			const now = new Date();
			now.setDate(now.getDate() + 2);
			expect(fromNowFilter(now)).toEqual('in 2 days');
		}));
	});
});
