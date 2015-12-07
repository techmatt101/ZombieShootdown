var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var chalk = require('chalk');

var isProduction = ($.util.env.dev || $.util.env.debug ? false : true);
var isDebug = !isProduction;

$.util.log('Environment: ' + chalk.inverse.bold(isProduction ? 'PRODUCTION' : 'DEBUG'));

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});

gulp.task('clean', del.bind(null, ['build/**/*']));

gulp.task('build', ['markup', 'assets', 'scripts', 'styles', 'other'], function() {
    if (isProduction) {
        gulp.start('size');
    }
});

gulp.task('size', function() {
    return gulp.src('build/**/*')
        .pipe($.size({ title: 'Build size total for', showFiles: true, gzip: true }));
});

gulp.task('watch', ['build'], function() {
    gulp.watch('src/**/*.ts', ['scripts']);
    $.util.log(chalk.blue("Now watching project"))
});

//===================================================//

gulp.task('markup', function() {
    return gulp.src('src/*.html')
        .pipe($.if(isProduction, $.minifyHtml()))
        .pipe(gulp.dest('build'));
});

gulp.task('scripts', function() {
    gulp.src('src/**/*.ts')
        .pipe($.if(isDebug, $.sourcemaps.init()))
        .pipe($.typescript({
            out: 'app.js',
            sortOutput: true
        }))
        .pipe($.if(isProduction, $.uglify()))
        .pipe($.if(isDebug, $.sourcemaps.write()))
        .pipe(gulp.dest('build'));
});

gulp.task('styles', function() {
    gulp.src('src/styles/**/*.less')
        .pipe($.if(isDebug, $.sourcemaps.init()))
        .pipe($.less())
        .pipe($.if(isProduction, $.minifyCss()))
        .pipe($.if(isDebug, $.sourcemaps.write()))
        .pipe(gulp.dest('build/styles'));
});

gulp.task('assets', function() {
    return gulp.src(['src/assets/**/*'])
        .pipe(gulp.dest('build/assets'));
});

gulp.task('other', function() {
    return gulp.src(['src/favicon.ico', 'src/config.js'])
        .pipe(gulp.dest('build'));
});