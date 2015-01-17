"use strict";

var gulp        = require('gulp'),
    del         = require('del'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    sass        = require('gulp-sass'),
    minifyCss   = require('gulp-minify-css'),
    typescript  = require('gulp-typescript'),
    tslint      = require('gulp-tslint'),
    concat      = require('gulp-concat'),
    gulpif      = require('gulp-if'),
    uglify      = require('gulp-uglify'),
    plumber     = require('gulp-plumber'),
    sourcemaps  = require('gulp-sourcemaps'),
    runSequence = require('run-sequence');

var production = process.argv.indexOf('--production') > -1 ||
                 process.env.NODE_ENV === 'production';

var dir = {
  app:  './app/',
  dist: './dist/',
  temp: './temp/',
  src:  './app/scripts/',
  scss: './app/styles/'
};

gulp.task('clean', del.bind(
  null,
  [
    dir.src  + '**/*.{js,map}',
    dir.scss + '**/*.css',
    dir.temp,
    dir.dist
  ]
));

gulp.task('sass', function(){
  return gulp.src(['**/*.scss'], {cwd: dir.scss})
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulpif(production, minifyCss()))
    .pipe(gulp.dest(dir.scss));
});

gulp.task('tslint', function(){
  return gulp.src(['**/*.ts', '!**/*.d.ts'], {cwd: dir.src})
    .pipe(tslint())
    .pipe(tslint.report('prose', {emitError: false}));
});

gulp.task('typescript', ['tslint'], function(){
  return gulp.src(['**/*.ts'], {cwd: dir.src})
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(typescript({
      target: "ES5",
      module: "commonjs",
      noImplicitAny: true,
      sortOutput: true
    }))
    .js
    .pipe(concat("app.js"))
    .pipe(gulpif(!production, sourcemaps.write('./')))
    .pipe(gulp.dest(dir.temp));
});

gulp.task('browserify', ['typescript'], function(){
  return browserify({entries: [dir.temp + 'app.js'], debug: true})
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulpif(!production, sourcemaps.init({loadMaps: true})))
    .pipe(gulpif(production, uglify()))
    .pipe(gulpif(!production, sourcemaps.write('./')))
    .pipe(gulp.dest(dir.src));
});

gulp.task('copy', function(){
  gulp.src(['**/*.html'], {cwd: dir.app})
    .pipe(gulp.dest(dir.dist));

  gulp.src(['**/*.js'], {cwd: dir.src})
    .pipe(gulp.dest(dir.dist + 'scripts'));

  gulp.src(['**/*.css'], {cwd: dir.scss})
    .pipe(gulp.dest(dir.dist + 'styles'));
});

gulp.task('watch', function(){
  gulp.watch(dir.scss + '**/*.scss', ['sass']);
  gulp.watch(dir.src  + '**/*.ts',   ['typescript']);
});

gulp.task('compile', ['sass', 'browserify']);
gulp.task('default', function(callback) {
  return runSequence(
    'clean',
    'compile',
    'copy',
    callback
  );
});