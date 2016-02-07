var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');
var bs = require('browser-sync').create();
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('clean', function(){
	return del([
		'bundle.js'
	]);
});

gulp.task('build:jsx', function(){
	return browserify('./main.js',	{ debug: true })
		.transform(babelify, { presets: ['es2015', 'react'] })
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('.'));
});

gulp.task('jsx-watch', ['build:jsx'], bs.reload);

gulp.task('serve', ['build:jsx'], function(){
	bs.init({
		proxy: 'localhost:3000'
	});
	require('./app')();

	gulp.watch('./main.js', ['jsx-watch']);
	gulp.watch('./screens/*.js', ['jsx-watch']);
});

gulp.task('default', [
	'clean',
	'serve'
]);