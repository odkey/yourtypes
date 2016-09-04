const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');

const dist = './app';

gulp.task('sass', () => {
  console.log('Transpile SCSS to CSS');
  gulp.src('./app/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest(`${ dist }/css` ));
});

gulp.task('sass:watch', () => {
  gulp.watch(['./app/sass/**/*.scss', './app/sass/**/_*.scss'], ['sass']);
});

gulp.task('watch', ['sass:watch']);
