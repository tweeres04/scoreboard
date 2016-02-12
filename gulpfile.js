var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');
var bs = require('browser-sync').create();
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('clean', () => {
	return del([
		'bundle.js',
		'dist'
	]);
});

gulp.task('jsx:dev', () => {
	return jsxBuilder('dev');
});

gulp.task('jsx:dist', () => {
	return jsxBuilder('dist');
});

function jsxBuilder(env){
	return browserify('./main.js',	{ debug: true })
		.transform(babelify, { presets: ['es2015', 'react'] })
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest(env == 'dist' ? 'dist' : '.'));
}

gulp.task('jsx-watch', ['jsx:dev'], bs.reload);

gulp.task('serve', ['jsx:dev'], () => {
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

gulp.task('build', ['clean', 'jsx:dist'], () => {
	return gulp.src([
			'index.html',
			'semantic/dist/semantic.min.js',
			'semantic/dist/semantic.min.css',
			'node_modules/jquery/dist/jquery.min.js',
			'app.js',
			'package.json',
			'api/**'
		], { base: '.' })
		.pipe(gulp.dest('dist'));
});