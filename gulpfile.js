var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var pump = require('pump');
var rev = require('gulp-rev-append');

gulp.task('minify-html', function() {
    return gulp.src('views/**/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist/views'));
});

gulp.task('minify-css', function() {
    return gulp.src('public/**/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('dist/public'));
});

gulp.task('compress', function(cb) {
    pump([
            gulp.src(['routes/**/*.js', 'public/**/*.js', 'models/**/*.js', 'util/**/*.js', 'settings.js'], { base: '.' }),
            uglify(),
            gulp.dest('dist')
        ],
        cb
    );
});

gulp.task('rev', function() {
    gulp.src('dist/views/**/*.html')
        .pipe(rev())
        .pipe(gulp.dest('dist/views'));
});

gulp.task('default', function() {
    // place code for your default task here
});