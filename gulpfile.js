var gulp = require('gulp');
var browserify = require('gulp-browserify');
var watch = require('gulp-watch');

// Basic usage
gulp.task('default', function() {
    // Single entry point to browserify
    gulp.src('src/bird.js')
        .pipe(browserify({
            transform: ["reactify"],
            debug : !gulp.env.production
        }))
        .pipe(gulp.dest("web"));
});

gulp.task('watch', function () {
    gulp.src('src/bird.js')
        .pipe(watch(function(files) {
            return files.pipe(browserify({
                    transform: ["reactify"],
                    debug : !gulp.env.production
                }))
                .pipe(gulp.dest("web"));
        }));
});