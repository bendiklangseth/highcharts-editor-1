"use strict";

const fs = require('fs');

const dest = 'dist/',
	buildDest = dest + 'bundles/',
	electronDest = 'app/',
	wpPluginDest = 'integrations/wordpress/highcharts-editor/',
	packageJson = require('./package.json'),
	name = 'highcharts-editor',
	gulp = require('gulp'),
	rename = require('gulp-rename'),
	uglify = require('gulp-terser'),
	concat = require('gulp-concat'),
	replace = require('gulp-replace-task'),
	less = require('gulp-less'),
	electron = require('gulp-electron'),
	jslint = require('gulp-jshint'),
	zip = require('gulp-zip'),
	run = require('gulp-run'),
	header = require('gulp-header'),
	license = fs.readFileSync(__dirname + '/LICENSE'),
	configDestination = require(__dirname + '/highed.editor.config.json'),
	//The order is important, so we don't do wildcard
	sources = require(__dirname + '/res/filelist.json'),
	configDest = __dirname + '/src/core',
	products = [
		'highcharts',
		'highstock',
		'highmaps'
	]
	;

////////////////////////////////////////////////////////////////////////////////

function appendFilesFromProduct(prodName) {
	const path = __dirname + '/src/products/' + prodName + '/',
		files = []
		;

	function include(folder) {
		var f;

		try {
			f = fs.readdirSync(path + folder);

			if (f) {
				f.forEach(function (f) {
					if (f.indexOf('.js') >= 0) {
						files.push(path + folder + '/' + f);
					}
				});
			}

		} catch (e) {
			console.log('error when including module', prodName, e);
		}
	}

	include('validators');
	include('samples');
	include('templates');
	return files;
}

let productFilenames = [];

products.forEach(function (product) {
	gulp.task(product + '-module', function () {
		let files = appendFilesFromProduct(product);
		productFilenames = productFilenames.concat(files);

		return gulp.src(files)
			.pipe(concat(name + '.module.' + product + '.js'))
			.pipe(gulp.dest(dest + '/modules/' + product))
			.pipe(rename(name + '.module.' + product + '.min.js'))
			.pipe(uglify())
			.pipe(header(license, packageJson))
			.pipe(gulp.dest(dest + '/modules/' + product))
			.pipe(gulp.dest(wpPluginDest))
			.pipe(zip(name + '.module.' + product + '.' + packageJson.version + '.min.zip'))
			.pipe(gulp.dest(buildDest));
	});
});


gulp.task('modules', gulp.series(products.map(function (p) { return p + '-module' })));

gulp.task('bundled-modules', gulp.series('modules'), function () {
	return gulp.src([dest + '/' + name + '.min.js'].concat(productFilenames))
		.pipe(concat(name + '.with.modules.min.js'))
		.pipe(uglify())
		.pipe(header(license, packageJson))
		.pipe(gulp.dest(dest))
		;
});

function build_Config() {
	return gulp.src(
		__dirname + '/highed.config.js'
	)
		.pipe(replace({
			patterns: [{
				match: '<%= config %>',
				replacement: configDestination
			}],
			usePrefix: false
		})
		)
		.pipe(gulp.dest(configDest));
};

////////////////////////////////////////////////////////////////////////////////

gulp.task('update-deps', function () {
	return run('node tools/update.deps.js').exec();
});

gulp.task('bake-advanced', function () {
	return run('node tools/dump2advanced.js').exec();
});

gulp.task('localization', function () {
	return run('node tools/gen.localization.js').exec();
});

gulp.task('bake-thumbnails', function () {
	return run('node tools/bake.previews.js').exec();
});

////////////////////////////////////////////////////////////////////////////////

gulp.task('cache-thumbnails', gulp.series('bake-thumbnails'), function () {
	return gulp.src('generated_src/highed.meta.images.js')
		// .pipe(gulp.dest(dest))
		.pipe(rename(name + '.thumbnails.min.js'))
		.pipe(uglify())
		.pipe(header(license, packageJson))
		.pipe(gulp.dest(dest))
});

////////////////////////////////////////////////////////////////////////////////


gulp.task('tinymce', function () {
	return gulp.src('integrations/tinymce.js')
		.pipe(concat(name + '.tinymce.js'))
		.pipe(gulp.dest(dest))
		.pipe(rename(name + '.tinymce.min.js'))
		.pipe(uglify())
		.pipe(header(license, packageJson))
		.pipe(gulp.dest(dest))
		;
});

gulp.task('ckeditor', function () {
	return gulp.src('integrations/ckeditor.js')
		.pipe(concat(name + '.ckeditor.js'))
		.pipe(gulp.dest(dest))
		.pipe(rename(name + '.ckeditor.min.js'))
		.pipe(uglify())
		.pipe(header(license, packageJson))
		.pipe(gulp.dest(dest))
		;
});

////////////////////////////////////////////////////////////////////////////////

gulp.task('less', function () {
	return gulp.src('less/theme.default.less')
		.pipe(less({
			paths: ['less/'],
			compress: true
		}))
		.pipe(rename(name + '.min.css'))
		.pipe(gulp.dest(dest))
		.pipe(gulp.dest(electronDest))
		.pipe(gulp.dest(wpPluginDest))
		;
});

gulp.task('lint', function () {
	return gulp.src(sources)
		.pipe(jslint({
			//  global: ['XMLHttpRequest']
		}))
		.pipe(jslint.reporter('default', {}))
		;
});

gulp.task('lint-advanced', function () {
	return gulp.src(sources.concat(['./generated_src/highed.meta.options.advanced.js']))
		.pipe(jslint({
			//  global: ['XMLHttpRequest']
		}))
		.pipe(jslint.reporter('default', {}))
		;
});

gulp.task('move-standalone', function () {
	return gulp.src([__dirname + '/res/standalone.html'])
		.pipe(gulp.dest(dest))
		;
});

gulp.task('minify', () => {
    return gulp.src(sources, {allowEmpty: true})
               .pipe(concat(name + '.js'))
               .pipe(gulp.dest(dest))
               .pipe(rename(name + '.min.js'))
               .pipe(uglify())
               .pipe(header(license, packageJson))
               .pipe(gulp.dest(dest))
               //.pipe(gulp.dest(electronDest))
               //.pipe(gulp.dest(wpPluginDest))
    ;
});

gulp.task('minify-advanced', gulp.series('bake-advanced', 'less'), function () {
	return gulp.src('./generated_src/highed.meta.options.advanced.js')
		.pipe(concat(name + '.advanced.js'))
		.pipe(gulp.dest(dest))
		.pipe(rename(name + '.advanced.min.js'))
		//.pipe(uglify())
		//.pipe(header(license, packageJson))
		.pipe(gulp.dest(dest));
});

gulp.task('plugins', function () {
	return gulp.src('plugins/*.js')
		.pipe(uglify())
		.pipe(header(license, packageJson))
		.pipe(gulp.dest(dest + 'plugins'))
		.pipe(gulp.dest(electronDest + 'plugins'))
		.pipe(zip(name + '.plugins.' + packageJson.version + '.zip'))
		.pipe(gulp.dest(buildDest))
		;
});

gulp.task('zip-tinymce', function () { //gulp.series('less', 'minify', 'tinymce'),
	return gulp.src([
		//   'dist/' + name + '.min.css',
		'dist/' + name + '.tinymce.js',
		'dist/' + name + '.tinymce.min.js'
		// 'dist/' + name + '.min.js',
		// 'dist/' + name + '.advanced.min.js'
	]).pipe(zip(name + '.tinymce.' + packageJson.version + '.zip'))
		.pipe(gulp.dest(buildDest))
		;
});

gulp.task('zip-ckeditor', function () { //, gulp.series('less', 'minify', 'ckeditor')
	return gulp.src([
		// 'dist/' + name + '.min.css',
		'dist/' + name + '.ckeditor.js',
		'dist/' + name + '.ckeditor.min.js'
		// 'dist/' + name + '.min.js',
		// 'dist/' + name + '.advanced.min.js'
	]).pipe(zip(name + '.ckeditor.' + packageJson.version + '.zip'))
		.pipe(gulp.dest(buildDest))
		;
});

gulp.task('zip-standalone', function () { //, gulp.series('less', 'minify')
	return gulp.src([
		'res/standalone.html',
		'dist/' + name + '.min.css',
		'dist/' + name + '.min.js'
	]).pipe(zip(name + '.standalone.' + packageJson.version + '.zip'))
		.pipe(gulp.dest(buildDest))
		;
});

gulp.task('zip-standalone-nominify', function () { // gulp.series('less', 'minify')
	return gulp.src([
		'dist/' + name + '.min.css',
		'dist/' + name + '.js'
	]).pipe(zip(name + '.dist.' + packageJson.version + '.zip'))
		.pipe(gulp.dest(buildDest))
		;
});

gulp.task('zip-dist', function () { // gulp.series('less', 'minify'),
	return gulp.src([
		'dist/' + name + '.min.css',
		'dist/' + name + '.min.js'
	]).pipe(zip(name + '.dist.min.' + packageJson.version + '.zip'))
		.pipe(gulp.dest(buildDest));
});

gulp.task('zip-dist-advanced', function () {
	return gulp.src([
		'dist/' + name + '.min.css',
		'dist/' + name + '.advanced.min.js',
		'dist/' + name + '.min.js'
	], { allowEmpty: true }).pipe(zip(name + '.dist.advanced.min.' + packageJson.version + '.zip'))
		.pipe(gulp.dest(buildDest));
});

gulp.task('wordpress', function () { //, gulp.series('less', 'minify', 'update-deps')
	return gulp.src([wpPluginDest + '*', wpPluginDest + 'dependencies/*'])
		.pipe(zip(name + '.wordpress.' + packageJson.version + '.zip'))
		.pipe(gulp.dest(buildDest))
		;
});


////////////////////////////////////////////////////////////////////////////////

gulp.task('build-electron', function () {
	return gulp.src('.', { allowEmpty: true })
		.pipe(electron({
			src: './dist',
			packageJson: packageJson,
			release: './dist',
			cache: './cache',
			version: 'v1.3.4',
			packaging: true,
			platforms: ['win32-x64', 'darwin-x64', 'linux-x64'],
			platformResources: {
				darwin: {
					CFBundleDisplayName: packageJson.name,
					CFBundleIdentifier: packageJson.name,
					CFBundleName: packageJson.name,
					CFBundleVersion: packageJson.version,
					icon: 'res/logo.png'
				},
				win: {
					"version-string": packageJson.version,
					"file-version": packageJson.version,
					"product-version": packageJson.version,
					"icon": 'res/logo.ico'
				}
			}
		}))
		.pipe(gulp.dest('.'))

		;
});

gulp.task('move-electron', gulp.series('build-electron'), function () {
	return gulp.src([
		'dist/electron/v1.3.4/' + packageJson.name + '-' + packageJson.version + '-darwin-x64.zip',
		'dist/electron/v1.3.4/' + packageJson.name + '-' + packageJson.version + '-linux-x64.zip',
		'dist/electron/v1.3.4/' + packageJson.name + '-' + packageJson.version + '-win32-ia32.zip'
	])
		.pipe(gulp.dest(buildDest))
});

////////////////////////////////////////////////////////////////////////////////

gulp.task('electron', gulp.series('update-deps', 'build-electron', 'move-electron'), (done) => {
	done();
});

gulp.task('default', gulp.series(build_Config, 'minify', 'tinymce', 'ckeditor', 'less', 'move-standalone', 'update-deps', 'plugins', 'wordpress', 'zip-standalone', 'zip-dist', 'zip-standalone-nominify', 'zip-tinymce', 'zip-ckeditor', 'modules'), (done) => {
	done();
});

gulp.task('with-advanced', gulp.series('minify-advanced', 'zip-dist-advanced', 'ckeditor', 'tinymce', 'less', 'plugins', 'wordpress', 'zip-standalone', 'zip-dist', 'zip-standalone-nominify', 'zip-tinymce', 'zip-ckeditor'), (done) => {
	done();
});

gulp.task('complete', gulp.series('default', 'cache-thumbnails', 'bundled-modules', 'with-advanced'), () => {
	return gulp.src([
		dest + '/' + name + '.with.modules.min.js',
		dest + '/' + name + '.advanced.js'
	])
		.pipe(concat(name + '.complete.js'))
		.pipe(uglify())
		.pipe(header(license, packageJson))
		.pipe(gulp.dest(dest))
		.pipe(gulp.dest(electronDest))
		//.pipe(gulp.src([dest + '/' + name + 'min.css']))
		.pipe(zip(name + '.complete.min.zip'))
		.pipe(gulp.dest(buildDest))
		;
});

gulp.task('all', gulp.series('default', 'electron', 'with-advanced', 'localization', 'complete'), (done) => {
	done()
});