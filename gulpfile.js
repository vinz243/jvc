var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var coffee = require('gulp-coffee');

var addsrc = require('gulp-add-src');


var paths = {
  sass: ['./www/**/*.scss'],
  coffee: ['./www/coffee/*.coffee'],
  css: [
     './www/lib/semantic-ui/build/packaged/definitions/css/semantic.min.css'
  ],
  js: [
     './www/lib/angular-route/angular-route.min.js'

  ]
};
gulp.task('default', ['sass']);
gulp.task('sass', function(done) {
  gulp.src('./www/sass/**.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(rename({
      extname: '.css'
    }))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./www/css'))
    .on('end', done);
});
gulp.task('css', function(done) {
  gulp.src(paths.css)
    .pipe(concat('vendors.css'))
    .pipe(gulp.dest('./www/css'))
    .on('end', done);
});
gulp.task('js', function(done) {
  gulp.src(paths.js)
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest('./www/js'))
    .on('end', done);
});
gulp.task('vendors', ['css', 'js']);
gulp.task('coffee', function(done) {
  gulp.src(paths.coffee)
    .pipe(coffee({
      bare: true
    }).on('error', gutil.log))
    .pipe(concat('application.js'))
    .pipe(gulp.dest('./www/js'))
    .on('end', done)
})
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass'])
  gulp.watch(paths.coffee, ['coffee'])
});
