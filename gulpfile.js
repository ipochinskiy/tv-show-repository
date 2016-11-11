const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const csso = require('gulp-csso');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const templateCache = require('gulp-angular-templatecache');
const babel = require('gulp-babel');
const uncss = require('gulp-uncss');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', () =>
    gulp.src('public/stylesheets/**/*.scss')
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(uncss({
            html: [
                'public/index.html',
                'public/views/add.html',
                'public/views/detail.html',
                'public/views/home.html',
                'public/views/login.html',
                'public/views/signup.html',
            ],
        }))
        .pipe(csso())
        .pipe(gulp.dest('public/stylesheets'))
);

gulp.task('compress', () => {
    gulp.src([
        'public/vendor/angular.js',
        'public/vendor/*.js',
        'public/app.js',
        'public/services/*.js',
        'public/controllers/*.js',
        'public/filters/*.js',
        'public/directives/*.js'
    ])
        .pipe(plumber())
        .pipe(babel({
            presets: [ 'es2015' ]
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public'));
});

gulp.task('watch', () => {
    gulp.watch('public/stylesheets/*.scss', [ 'sass' ]);
    gulp.watch('public/views/**/*.html', [ 'templates' ]);
    gulp.watch([
        'public/**/*.js',
        '!public/app.min.js',
        '!public/templates.js',
        '!public/vendor'
    ], [ 'compress' ]);
});

gulp.task('templates', () => {
    gulp.src('public/views/**/*.html')
        .pipe(plumber())
        .pipe(templateCache({ root: 'views', module: 'MyApp' }))
        .pipe(gulp.dest('public'));
});

// TODO: split it into `build` and `watch` tasks
gulp.task('default', [ 'sass', 'compress', 'templates', 'watch' ]);
