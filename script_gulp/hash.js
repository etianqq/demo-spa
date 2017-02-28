/**
 * Created by linaqiu on 2017/2/28.
 */
var gulp = require('gulp');
var rev = require('gulp-rev');
var runSequence = require('run-sequence');

gulp.task('hashjs_config', function () {
    return gulp.src(['dist/config/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('dist/config'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/config'));
});
gulp.task('hashjs', function () {
    return gulp.src(['dist/js/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('dist/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/js'));
});
gulp.task('hashjs_lib', function () {
    return gulp.src(['dist/lib/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('dist/lib'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/lib'));
});
gulp.task('hashjs_online', function () {
    return gulp.src(['dist/js_online/**/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('dist/js_online'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/js_online'));
});
gulp.task('hashcss', function () {
    return gulp.src(['dist/css/*.css'])
        .pipe(rev())
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/css'))
});
gulp.task('hashhtml', function () {
    return gulp.src(['dist/template/**/*'])
        .pipe(rev())
        .pipe(gulp.dest('dist/template'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/template'))
});

gulp.task('hash', function (cb) {
    runSequence(['hashjs', 'hashjs_lib', 'hashjs_config', 'hashjs_online', 'hashcss', 'hashhtml'], cb);
});