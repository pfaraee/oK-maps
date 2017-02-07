var gulp = require('gulp');
var babel = require('gulp-babel');
var connect = require('gulp-connect');

gulp.task('connect', function(){
  connect.server({
    root: 'public',
    livereload: true
  });
});

gulp.task('livereload', function (){
  gulp.src('./public/**/*')
  .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('./src/**/*.js', ['build']);
  gulp.watch('./public/**/*', ['livereload']);
});

gulp.task('build', function() {
  return gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('public/build'));
});

gulp.task('default', ['connect', 'watch', 'build']);
