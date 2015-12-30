var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');
var bs = require('browser-sync').create();
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

gulp.task('clean', function(){
	return del([
		'bundle.js'
	]);
});

gulp.task('build:jsx', function(){
	var b = browserify({
		entries: './main.js',
		debug: true,
		transform: [reactify]
	});

	return b.bundle()
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