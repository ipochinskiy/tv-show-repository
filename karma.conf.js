module.exports = function (config) {
	config.set({
		basePath: './',

		files: [
			'assets/vendor/angular.js',
			'assets/vendor/*.js',
			'ng/app.js',
			'ng/services/*.js',
			'ng/controllers/*.js',
			'ng/filters/*.js',
			'ng/directives/*.js',
			'test/ng/*.js'
		],

		autoWatch: true,

		frameworks: ['jasmine'],

		browsers: ['PhantomJS'],

		plugins: [
			'karma-phantomjs-launcher',
			'karma-chrome-launcher',
			'karma-jasmine'
		]
	});
};
