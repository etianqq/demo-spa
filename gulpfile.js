var gulp = require('gulp');
var gutil = require('gulp-util');
var ftp = require('gulp-ftp');
var jshint = require('gulp-jshint');
var del = require('del');
var fs = require('fs');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

require('./script_gulp/uglify.js');
require('./script_gulp/hash.js');
require('./script_gulp/rev.js');

/*-----------------------------get ftp config-----------------------------------*/
var ftpConfig = {ftp_beta: {}, ftp_test: {}, ftp_release: {}};
//配置文件优先级更
try {
    ftpConfig = require('./ftp.json');
} catch (ex) {
    console.log(ex);
}

/*-----------------------------conver scss to css-----------------------------------*/
gulp.task("sass", function () {
    gulp.src(["./src/sass/app.scss"]).pipe(sourcemaps.init()).pipe(sass().on("error", sass.logError)).pipe(concat("app.css")).pipe(minifycss()).pipe(sourcemaps.write("./src/map")).pipe(gulp.dest("./src/css"));
});

// sass watch: once *.scss file is modified, run [sass] task and update css files
gulp.task("sass:watch", function () {
    gulp.watch("./src/sass/*/*.scss", ["sass"]);
});

/*-----------------------------upload files by ftp-----------------------------------*/
gulp.task('ftp', function () {
    var argv = require('yargs').argv;
    if (argv.test) {
        return gulp.src('dist/**/*')
            .pipe(ftp(ftpConfig.ftp_test))
            .pipe(gutil.noop());
    }
    else if (argv.beta) {
        return gulp.src('dist/**/*')
            .pipe(ftp(ftpConfig.ftp_beta))
            .pipe(gutil.noop());
    }
    else if (argv.release) {
        return gulp.src('dist/**/*')
            .pipe(ftp(ftpConfig.ftp_release))
            .pipe(gutil.noop());
    }
    else {
        console.log('need --test, --beta or --release');
    }
});

/*-----------------------------review js codes-----------------------------------*/
gulp.task('jshint', function () {
    return gulp.src('./js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail')); //when find a problem is found, it stop the task.
});

/*-----------------------------webpack-----------------------------------*/
gulp.task('webpack:watch', shell.task('webpack --watch'));
gulp.task('default', shell.task('webpack'));
gulp.task('js_online', shell.task('webpack'));

/*-----------------------------clean-----------------------------------*/
gulp.task('clean', function () {
    del(['dist/*'])
});

/*-----------------------------copy-----------------------------------*/
gulp.task('copy', function () {
    gulp.src(['src/**/*', '!src/sass/*', '!src/sass/*/*', '!src/js_template/*/*.js', '!src/config/webconfig*.js']).pipe(gulp.dest('dist/'));
});

/*-----------------------------update webconfig file-----------------------------------*/
gulp.task('webconfig', function () {
    var argv = require('yargs').argv;
    if (argv.test) {
        return gulp.src(['src/config/webconfig_test.js'])
            .pipe(rename('webconfig.js'))
            .pipe(gulp.dest('dist/config/'));
    } else if (argv.beta) {
        return gulp.src(['src/config/webconfig_beta.js'])
            .pipe(rename('webconfig.js'))
            .pipe(gulp.dest('dist/config/'));
    } else if (argv.release) {
        return gulp.src(['src/config/webconfig_release.js'])
            .pipe(rename('webconfig.js'))
            .pipe(gulp.dest('dist/config/'));
    }
    else {
        console.log('need --test, --beta, or --release');
    }
});

/*-----------------------------publish-----------------------------------*/
gulp.task('publish', function (cb) {
    runSequence('clean', 'sass', 'js_online', 'copy', 'webconfig', cb);
});

gulp.task('uglify_hash', function (cb) {
    runSequence('uglify', 'hash', 'rev', cb);
});
