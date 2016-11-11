const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const csso = require('gulp-csso');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const templateCache = require('gulp-angular-templatecache');
const uncss = require('gulp-uncss');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', () =>
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
        .pipe(gulp.dest('public/'))
);

gulp.task('compress', () => {
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

gulp.task('watch', () => {
    gulp.watch('assets/stylesheets/*.scss', [ 'sass' ]);
    gulp.watch('ng/views/**/*.html', [ 'templates' ]);
    gulp.watch([
        'ng/**/*.js',
    ], [ 'compress' ]);
});

gulp.task('templates', () => {
    gulp.src('ng/views/**/*.html')
        .pipe(plumber())
        .pipe(templateCache({ root: 'views', module: 'MyApp' }))
        .pipe(gulp.dest('public'));
});

// TODO: split it into `build` and `watch` tasks
gulp.task('default', [ 'sass', 'compress', 'templates', 'watch' ]);
