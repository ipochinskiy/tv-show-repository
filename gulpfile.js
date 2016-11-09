const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const csso = require('gulp-csso');

gulp.task('sass', () => gulp
  .src('public/stylesheets/**/*.scss')
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(csso())
  .pipe(gulp.dest('public/stylesheets'))
);

gulp.task('watch', () => gulp.watch('public/stylesheets/*.scss', ['sass']));

gulp.task('default', ['sass', 'watch']);
