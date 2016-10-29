const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');

gulp.task('sass', function() {
  gulp.src('public/stylesheets/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('watch', () => gulp.watch('public/stylesheets/*.scss', ['sass']));

gulp.task('default', ['sass', 'watch']);
