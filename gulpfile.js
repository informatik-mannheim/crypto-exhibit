var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var gutil = require('gulp-util');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

// Set the banner content
var banner = ['/*!\n',
' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
' * Copyright ' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
' */\n',
''
].join('');

// Compile LESS files from /less into /css
gulp.task('less', function() {
	return gulp.src('less/style.less')
		.pipe(less().on('error', function(e) { gutil.log(e); this.emit('end'); }))
		.pipe(header(banner, { pkg: pkg }))
		.pipe(gulp.dest('css'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
	return gulp.src('css/style.css')
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('css'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

// Minify JS
gulp.task('minify-js', function() {
	return gulp.src('js/script.js')
		.pipe(uglify().on('error', function(e) { gutil.log(e); this.emit('end'); }))
		.pipe(header(banner, { pkg: pkg }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('js'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
	gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
		.pipe(gulp.dest('ext/bootstrap'))

	gulp.src(['node_modules/tether/dist/**'])
		.pipe(gulp.dest('ext/tether'))
	
	gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
		.pipe(gulp.dest('ext/jquery'))

	gulp.src([
		'node_modules/@fortawesome/fontawesome-free-webfonts/**',
		'!node_modules/@fortawesome/fontawesome-free-webfonts/css',
		'!node_modules/@fortawesome/fontawesome-free-webfonts/**/*.map',
		'!node_modules/@fortawesome/fontawesome-free-webfonts/.npmignore',
		'!node_modules/@fortawesome/fontawesome-free-webfonts/*.txt',
		'!node_modules/@fortawesome/fontawesome-free-webfonts/*.md',
		'!node_modules/@fortawesome/fontawesome-free-webfonts/*.json'
	]).pipe(gulp.dest('ext/font-awesome'))

	gulp.src(['node_modules/@fortawesome/fontawesome-free-webfonts/css/*',])
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('ext/font-awesome/css'))

	gulp.src(['node_modules/responsive-toolkit/dist/bootstrap-toolkit.js', 'node_modules/responsive-toolkit/dist/bootstrap-toolkit.min.js'])
		.pipe(gulp.dest('ext/bootstrap-toolkit'))

	gulp.src(['node_modules/big-integer/BigInteger.js', 'node_modules/big-integer/BigInteger.min.js'])
		.pipe(gulp.dest('ext/big-integer'))
});

// Run everything
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy']);

// Configure browserWatch task
gulp.task('watch', function() {
	gulp.watch('less/*.less', ['less']);
	gulp.watch(['css/*.css', '!css/*.min.css'], ['minify-css']);
	gulp.watch(['js/*.js', '!js/*.min.js'], ['minify-js']);

	// Reloads the browser whenever HTML or JS files change
	gulp.watch(['views/**/*.ejs', 'server.js', 'js/**/*.js'], browserSync.reload);
});

// Node monitor
gulp.task('nodemon', function(callback) {
    var callbackCalled = false;
    return nodemon({ script: 'server.js' }).on('start', function() {
        if(!callbackCalled) {
            callbackCalled = true;
            callback();
        }
    });
});

// Dev tasks (connect with browser sync.)
gulp.task('dev', ['watch', 'less', 'minify-css', 'minify-js', 'nodemon'], function() {
	browserSync.init({
		proxy: 'http://localhost:5000', // port of node server
	});
});