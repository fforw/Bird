var gulp = require('gulp');
var browserify = require('gulp-browserify');
var watch = require('gulp-watch');

var browserifyConfig = {
    transform: ["reactify"],
    debug : !gulp.env.production
};

// Basic usage
gulp.task('default', function() {
    // Single entry point to browserify
    gulp.src('src/bird.js')
        .pipe(browserify(browserifyConfig))
        .pipe(gulp.dest("web"));
});

gulp.task('watch', function () {
    gulp.src('src/bird.js')
        .pipe(watch(function(files) {
            return files.pipe(browserify(browserifyConfig))
                .pipe(gulp.dest("web"));
        }));
});