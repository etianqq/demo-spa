/**
 * Created by linaqiu on 2017/2/28.
 */
var gulp = require('gulp');
var revCollector = require('gulp-rev-collector');
var runSequence = require('run-sequence');

// 加hash
gulp.task('rev_html', function () {
    gulp.src(['dist/**/*.json', 'dist/index.html', 'dist/login.html']) //
        .pipe(revCollector()) //- 替换后的文件输出
        .pipe(gulp.dest('dist/'));
});

gulp.task('rev_js', function () {
    gulp.src(['dist/*/*.json', 'dist/config/config_route-*.js']) //
        .pipe(revCollector()) //- 替换后的文件输出
        .pipe(gulp.dest('dist/config/'));
});

gulp.task('rev', function (cb) {
    runSequence('rev_html', 'rev_js', cb);
});