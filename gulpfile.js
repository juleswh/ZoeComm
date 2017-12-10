'use strict';
    
var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var jshint      = require('gulp-jshint');
var reload      = browserSync.reload;

var src = {
    scss: './www/sass/*.scss',
    css:  './www/sass/compiled',
    html: './www/**/*.html'
};

gulp.task('serve', ['sass'], function() {

    browserSync({
        server: {
            baseDir: "./www"
        },
        logLevel: 'debug',
        logConnections: true
    });

    gulp.watch(src.scss, ['sass']);
    gulp.watch('./www/**/*').on('change', reload);
});

// Compile sass into CSS
gulp.task('sass', function() {
    return gulp.src(src.scss)
        .pipe(sass())
        .pipe(gulp.dest(src.css))
        .pipe(reload({stream: true}));
});

gulp.task('default', ['serve']);

gulp.task('lint', function() {
  return gulp.src('./www/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});