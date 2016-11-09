const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const csso = require('gulp-csso');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const templateCache = require('gulp-angular-templatecache');

gulp.task('sass', () => gulp
  .src('public/stylesheets/**/*.scss')
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(csso())
  .pipe(gulp.dest('public/stylesheets'))
);

gulp.task('compress', function() {
  gulp.src([
    'public/vendor/angular.js',
    'public/vendor/*.js',
    'public/app.js',
    'public/services/*.js',
    'public/controllers/*.js',
    'public/filters/*.js',
    'public/directives/*.js'
  ])
    .pipe(concat('app.min.js'))
    .pipe(uglify())
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

gulp.task('default', [ 'sass', 'compress', 'watch' ]);
