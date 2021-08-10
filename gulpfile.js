'use strict';

const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleancss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename = require("gulp-rename");
const gcmq = require('gulp-group-css-media-queries');
const webpack = require('webpack-stream');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const del = require('del'); 

sass.compiler = require('node-sass');

//  style

gulp.task ('sass', function () {
    return gulp.src('./src/assets/scss/*.scss')
        .pipe(sass().on('error',sass.logError))
        .pipe(autoprefixer({
			cascade: false
		}))
        .pipe(gcmq())
        .pipe(cleancss({ level: { 1: { specialComments: 0 } },/* format: 'beautify' */ }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./src/assets/css'))
        .pipe(browserSync.reload({ stream:true }));;
});


// js

gulp.task ('script', function () {
	return gulp.src(['./src/assets/js/*.js', './src/assets/js/*.min.js'])
		.pipe(webpack({
			mode: 'production',
			performance: { hints: false },
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
						query: {
							presets: ['@babel/env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				]
			}
		})).on('error', function handleError() {
			this.emit('end')
		})
		.pipe(rename('index.min.js'))
		.pipe(gulp.dest('./src/assets/js'))
		.pipe(browserSync.stream())
});

// browserSync 

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./src",
        },
        // tunnel: true
    });
}
);

// checkupdate

gulp.task('checkupdate', function () {
    gulp.watch('./src/assets/scss/**/*.scss', gulp.parallel('sass'));
    gulp.watch('./src/*.html').on('change',browserSync.reload);
    gulp.watch('./src/assets/js/*.js').on('change',browserSync.reload);
});

// watch

gulp.task('watch', gulp.parallel('sass','script','checkupdate','browser-sync'));

// clean

gulp.task ('cleanDist', function (){
	return del('dist/**/*', { force: true })
});

//  img
gulp.task ('img', function () {
    return gulp.src('./src/assets/img/**/*')
		.pipe(newer('./dist/assets/img/'))
		.pipe(imagemin())
		.pipe(gulp.dest('./dist/assets/img/'))
		.pipe(browserSync.stream())
});

// build

gulp.task ('buildTransfer', function (){
	return gulp.src([
		'{./src/assets/js,./src/assets/css}/*.min.*',
		'./src/assets/fonts/**/*',
		'./src/*.html',
		], { base: './src/assets' }) 
		.pipe(gulp.dest('./dist/assets')) 
});

gulp.task ('build', gulp.series('cleanDist',gulp.parallel('img','buildTransfer')));