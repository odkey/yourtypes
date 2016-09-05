const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');

const dist = './app';

gulp.task('sass', ['sass:log', 'sass:impl']);

gulp.task('sass:log', () => {
  console.log('Transpile SCSS to CSS');
});

gulp.task('sass:impl', ['sass:impl:top', 'sass:impl:kerning_training']);

gulp.task('sass:impl:top', () => {
  gulp.src('./app/sass/top/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest(`${ dist }/top/css`));
});

gulp.task('sass:impl:kerning_training', () => {
  gulp.src('./app/sass/kerning_training/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest(`${ dist }/kerning_training/css`));
});

gulp.task('watch:sass', () => {
  gulp.watch(['./app/sass/**/*.scss', './app/sass/**/_*.scss'], ['sass']);
});

gulp.task('watch', ['watch:sass']);
