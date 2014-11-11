var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var coffee = require('gulp-coffee');
var replace = require('gulp-replace');

var argv = require('yargs').argv;
// var iconfont = require('gulp-iconfont');
// var iconfontCss = require('gulp-iconfont-css');



var paths = {
  sass: ['./src/**/*.scss'],
  coffee: [
    './src/coffee/app.coffee',
    './src/coffee/xml2json.coffee',
    './src/coffee/controllers/**/*.coffee',
    './src/coffee/router.coffee',
    './src/coffee/**/*.coffee'
  ],
  css: [
    //     './www/lib/semantic-ui/build/packaged/definitions/css/semantic.min.css'
    './lib/angular-material/angular-material.min.css',
    './lib/ionicons/css/ionicons.min.css'
  ],
  js: [
    './lib/jquery/dist/jquery.min.js',
    './lib/angular/angular.js',
    './lib/angular-ui-router/release/angular-ui-router.min.js',
    './lib/angular-aria/angular-aria.js',
    './lib/angular-animate/angular-animate.js',
    './lib/hammerjs/hammer.js',
    './lib/angular-material/angular-material.min.js',
    './lib/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
    "./lib/marka/dist/js/marka.js",
    //    './www/lib/angular-bindonce/bindonce.js',
  ]
};

vars = {
  hosts: {

  }
}

if (!argv.host) {
  var os = require('os');
  var ifaces = os.networkInterfaces();
  for (var dev in ifaces) {
    var alias = 0;
    // CHANGE THE STRING IN ORDER TO GET THE RIGHT ADRESS

    ifaces[dev].forEach(function(details) {
      if (details.family == 'IPv4') {
        vars.hosts[dev] = details.address
      }
    });
  }

  vars.INET_ADDR = vars.hosts['eth0'] + ':8101'
} else {
  vars.INET_ADDR = argv.host
}
gulp.task('default', ['sass']);
gulp.task('sass', function(done) {
  gulp.src(paths.sass)
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
      }).on('error', gutil.log)
      .on('error', gutil.beep)
      .on('error', function(error) {
        this.emit('end');
      }))
    .pipe(replace(/%([\w_]+)%/g, function(string, theVar) {
      var data = eval('(vars.' + theVar + ')');
      console.log('Replacing ' + theVar + ' with ' + data);
      return data;
    })).pipe(concat('application.js'))
    .pipe(gulp.dest('./www/js'))
    .on('end', done)
})
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass'])
  gulp.watch(paths.coffee, ['coffee'])
});
gulp.task('build', ['vendors', 'coffee', 'sass']);
