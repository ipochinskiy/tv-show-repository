const concat = require('gulp-concat');
const csso = require('gulp-csso');
const ngmin = require('gulp-ngmin');
const del = require('del');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const templateCache = require('gulp-angular-templatecache');

const rimraf = require('rimraf');

gulp.task('clear', () => {
    rimraf.sync('./public');
});

gulp.task('static', [], () => {
    gulp.src([
        'assets/**',
        '!assets/stylesheets',
        '!assets/stylesheets/*.css',
        '!assets/stylesheets/*.scss',
        '!assets/vendor',
        '!assets/vendor/**',

        'ng/index.html'
    ])
    .pipe(gulp.dest('public/'));
});

gulp.task('sass', [], () =>
    gulp.src('assets/stylesheets/**/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(csso())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/stylesheets'))
);

gulp.task('css', [], () =>
    gulp.src('assets/stylesheets/**/*.css')
        .pipe(plumber())
        .pipe(csso())
        .pipe(gulp.dest('public/stylesheets'))
);

gulp.task('compress', [], () => {
    gulp.src([
        'assets/vendor/angular.js',
        'assets/vendor/*.js',
        'ng/app.js',
        'ng/services/*.js',
        'ng/controllers/*.js',
        'ng/filters/*.js',
        'ng/directives/*.js'
    ])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(ngmin())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public'));
});

gulp.task('templates', [], () => {
    gulp.src('ng/views/**/*.html')
        .pipe(plumber())
        .pipe(templateCache({ root: 'views', module: 'MyApp' }))
        .pipe(gulp.dest('public'));
});

gulp.task('copyPublic', [ 'sass', 'css', 'static', 'compress', 'templates' ]);

gulp.task('build', [ 'clear', 'copyPublic' ]);

gulp.task('watch', [ 'build' ], () => {
    gulp.watch('assets/stylesheets/*.scss', [ 'sass' ]);
    gulp.watch('assets/stylesheets/*.css', [ 'css' ]);
    gulp.watch('ng/views/**/*.html', [ 'templates' ]);
    gulp.watch('ng/**/*.js', [ 'compress' ]);
});

gulp.task('default', [ 'watch' ]);
