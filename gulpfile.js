var gulp = require('gulp');
var run = require('gulp-run');

gulp.task('default', ['references', 'client', 'server']);

gulp.task('references', function () {
    run('python build_references.py').exec();
});

gulp.task('client', function () {
    run('tsc src/app.ts --out build/app.js --sourcemap --target ES5').exec();
});

gulp.task('server', function () {
    run('tsc src/server.ts --outDir build/ --target ES5 --module commonjs').exec();
});