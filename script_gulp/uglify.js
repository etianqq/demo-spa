/**
 * Created by linaqiu on 2017/2/28.
 */
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');

/*-----------------------------uglify js codes-----------------------------------*/
gulp.task('uglify_js', function () {
    return gulp.src(['dist/js/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});
gulp.task('uglify_lib', function () {
    return gulp.src(['dist/lib/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/lib'));
});
gulp.task('uglify_online', function () {
    return gulp.src(['dist/js_online/**/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/js_online'));
});

gulp.task('uglify', function (cb) {
    runSequence(['uglify_js', 'uglify_lib', 'uglify_online'], cb);
});