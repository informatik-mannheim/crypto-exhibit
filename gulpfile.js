var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
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
' * Licensed under <%= pkg.license %>\n',
' */\n',
''
].join('');

// Reload function for browserSync
function reloadBrowser(done) {
	browserSync.reload();
	done();
}

// Compile LESS files from /less into /css
gulp.task('less', function() {
	return gulp.src('less/style.less')
		.pipe(less().on('error', function(e) { console.log(e); this.emit('end'); }))
		.pipe(header(banner, { pkg: pkg }))
		.pipe(gulp.dest('css'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

// Minify compiled CSS
gulp.task('minify-css', gulp.series('less', function() {
	return gulp.src('css/style.css')
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('css'))
		.pipe(browserSync.reload({
			stream: true
		}))
}));

// Minify JS
gulp.task('minify-js', function() {
	return gulp.src(['js/**/*.js', '!**/*.min.js'])
		.pipe(uglify().on('error', function(e) { console.log(e); this.emit('end'); }))
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

	gulp.src(['node_modules/requirejs/require.js', 'node_modules/requirejs/require.min.js'])
		.pipe(gulp.dest('ext/requirejs'))

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

	gulp.src(['node_modules/node-forge/dist/forge.min.js', 'node_modules/node-forge/dist/forge.all.min.js'])
		.pipe(gulp.dest('ext/forge'))
});

// Configure browserWatch task
gulp.task('watch', function() {
	gulp.watch('less/*.less', gulp.series('less'));
	gulp.watch(['css/*.css', '!css/**/*.min.css'], gulp.series('minify-css'));
	gulp.watch(['js/**/*.js', '!js/**/*.min.js'], gulp.series('minify-js'));

	// Reloads the browser whenever HTML or JS files change
	gulp.watch(['views/**/*.ejs', '*.js', 'js/**/*.js', '!js/**/*.min.js'], reloadBrowser);
});

// Node monitor
gulp.task('nodemon', function(done) {
    var callbackCalled = false;
    return nodemon({ script: 'server.js', watch: ['server.js', 'helper.js'] }).on('start', function() {
        if(!callbackCalled) {
            callbackCalled = true;
            done();
        }
    }).on('restart', browserSync.reload);
});

// Browser Sync
gulp.task('browser-sync', gulp.series('nodemon', function() {
	browserSync.init({
		proxy: 'http://localhost:5000', // port of node server
	});
}));

// Dev tasks (connect with browser sync.)
gulp.task('dev', gulp.series('minify-css', 'minify-js', gulp.parallel('browser-sync', 'watch')));