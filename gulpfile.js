const concat = require('gulp-concat');
const csso = require('gulp-csso');
const del = require('del');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const templateCache = require('gulp-angular-templatecache');
const uglify = require('gulp-uglify');
const uncss = require('gulp-uncss');

gulp.task('clear', () => {
    del([
        'public/**/*',
        '!public'
    ]);
});

gulp.task('static', [ 'clear' ], () => {
    gulp.src([
        'assets/**',
        '!assets/stylesheets',
        '!assets/stylesheets/*.scss',
        '!assets/vendor',
        '!assets/vendor/**',

        'ng/index.html'
    ])
    .pipe(gulp.dest('public/'));
});

gulp.task('sass', [ 'clear' ], () =>
    gulp.src('assets/stylesheets/**/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(uncss({
            html: [
                'ng/index.html',
                'ng/views/add.html',
                'ng/views/detail.html',
                'ng/views/home.html',
                'ng/views/login.html',
                'ng/views/signup.html',
            ],
        }))
        .pipe(csso())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/stylesheets'))
);

gulp.task('compress', [ 'clear' ], () => {
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
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public'));
});

gulp.task('templates', [ 'clear' ], () => {
    gulp.src('ng/views/**/*.html')
        .pipe(plumber())
        .pipe(templateCache({ root: 'views', module: 'MyApp' }))
        .pipe(gulp.dest('public'));
});

gulp.task('build', [ 'sass', 'static', 'compress', 'templates' ]);

gulp.task('watch', [ 'build' ], () => {
    gulp.watch('assets/stylesheets/*.scss', [ 'sass' ]);
    gulp.watch('ng/views/**/*.html', [ 'templates' ]);
    gulp.watch([
        'ng/**/*.js',
    ], [ 'compress' ]);
});

gulp.task('default', [ 'watch' ]);
