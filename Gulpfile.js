var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('gulp-browserify');
var babelify = require('babelify');
var browserSync = require('browser-sync').create();
var rename = require('gulp-rename');
var eslint = require('gulp-eslint');

// keeps gulp from crashing for scss errors
gulp.task('sass', function () {
  return gulp.src('./src/sass/main.scss')
      .pipe(sass({ errLogToConsole: true }))
      .pipe(gulp.dest('./public/css'))
      .pipe(browserSync.stream());;
});

gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['./src/**/*.js'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

gulp.task('js', function() {
  return gulp.src('./src/index.js')
    .pipe(browserify({
      insertGlobals : true,
      transform: [babelify.configure({
        presets: ['es2015']
      })]
    }))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./public/'));
});

gulp.task('js-watch', ['js'], function (done) {
  browserSync.reload();
  done();
});

// use default task to launch Browsersync and watch JS files
gulp.task('serve', ['js'], function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./public/"
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch("./src/**/*.js", ['js-watch']);
    gulp.watch("./src/sass/**/*.scss", ['sass']);
    gulp.watch("./public/**/*.html").on('change', browserSync.reload);
});

gulp.task('default', ['serve']);
