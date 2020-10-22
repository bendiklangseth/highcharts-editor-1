"use strict";

const fs = require('fs');

var dest = 'dist/',
    buildDest = dest + 'bundles/',
    electronDest = 'app/',
    wpPluginDest = 'integrations/wordpress/highcharts-editor/',
    packageJson = require('./package.json'),
    name = 'highcharts-editor',
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
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
    var path = __dirname + '/src/products/' + prodName + '/',
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
                 .pipe(concat(name + '.module.' + product  + '.js'))
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

function modules() {
  products.map(function (p) { return p + '-module'});
}

gulp.task('bundled-modules', () => gulp.series(modules, function () {
  return gulp.src([dest + '/' + name + '.min.js'].concat(productFilenames))
         .pipe(concat(name + '.with.modules.min.js'))
         .pipe(uglify())
         .pipe(header(license, packageJson))
         .pipe(gulp.dest(dest))
  ;
}));

function buildConfig(){
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
  .pipe(gulp.dest(configDest))
}

gulp.task('complete', () => gulp.series('default', 'cache-thumbnails', 'bundled-modules', withAdvanced, function () {
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
}));

////////////////////////////////////////////////////////////////////////////////

function updateDeps(){
  return run('node tools/update.deps.js').exec();
}


function bakeAdvanced(){
  return run('node tools/dump2advanced.js').exec();
}

function localization(){
  return run('node tools/gen.localization.js').exec();
}

function bakeThumbnails() {
  return run('node tools/bake.previews.js').exec();
}

gulp.task('cache-thumbnails', () => gulp.series(bakeThumbnails, function () {
  return gulp.src('generated_src/highed.meta.images.js')
             // .pipe(gulp.dest(dest))
             .pipe(rename(name + '.thumbnails.min.js'))
             .pipe(uglify())
             .pipe(header(license, packageJson))
             .pipe(gulp.dest(dest))
}));

////////////////////////////////////////////////////////////////////////////////

gulp.task('zip-tinymce', () => gulp.series(Less, minify, tinymce, function () {
    return gulp.src([
               //   'dist/' + name + '.min.css',
                  'dist/' + name + '.tinymce.js',
                  'dist/' + name + '.tinymce.min.js'
                 // 'dist/' + name + '.min.js',
                 // 'dist/' + name + '.advanced.min.js'
                ]).pipe(zip(name + '.tinymce.' + packageJson.version + '.zip'))
                  .pipe(gulp.dest(buildDest))
    ;
}));

gulp.task('zip-ckeditor', () => gulp.series(Less, minify, ckeditor, function () {
    return gulp.src([
                 // 'dist/' + name + '.min.css',
                  'dist/' + name + '.ckeditor.js',
                  'dist/' + name + '.ckeditor.min.js'
                 // 'dist/' + name + '.min.js',
                 // 'dist/' + name + '.advanced.min.js'
                ]).pipe(zip(name + '.ckeditor.' + packageJson.version + '.zip'))
                  .pipe(gulp.dest(buildDest))
    ;
}));

gulp.task('zip-standalone', () => gulp.series(Less, minify, function () {
  return gulp.src([
            'res/standalone.html',
            'dist/' + name + '.min.css',
            'dist/' + name + '.min.js'
         ]).pipe(zip(name + '.standalone.' + packageJson.version + '.zip'))
           .pipe(gulp.dest(buildDest))
  ;
}));

gulp.task('zip-standalone-nominify', () => gulp.series(Less, minify, function () {
  return gulp.src([
            'dist/' + name + '.min.css',
            'dist/' + name + '.js'
         ]).pipe(zip(name + '.dist.' + packageJson.version + '.zip'))
           .pipe(gulp.dest(buildDest))
  ;
}));

gulp.task('zip-dist', () => gulp.series(Less, minify, function () {
  return gulp.src([
            'dist/' + name + '.min.css',
            'dist/' + name + '.min.js'
         ]).pipe(zip(name + '.dist.min.' + packageJson.version + '.zip'))
           .pipe(gulp.dest(buildDest));
}));

gulp.task('zip-dist-advanced', () =>  gulp.series(Less, minify, 'minify-advanced', function () {
  return gulp.src([
            'dist/' + name + '.min.css',
            'dist/' + name + '.advanced.min.js',
            'dist/' + name + '.min.js'
         ]).pipe(zip(name + '.dist.advanced.min.' + packageJson.version + '.zip'))
           .pipe(gulp.dest(buildDest));
}));

////////////////////////////////////////////////////////////////////////////////

gulp.task('wordpress', () => gulp.series(Less, minify, updateDeps, function () {
    return gulp.src([wpPluginDest + '*', wpPluginDest + 'dependencies/*'])
               .pipe(zip(name + '.wordpress.' + packageJson.version + '.zip'))
               .pipe(gulp.dest(buildDest))
    ;
}));

function tinymce(){
  return gulp.src('integrations/tinymce.js')
               .pipe(concat(name + '.tinymce.js'))
               .pipe(gulp.dest(dest))
               .pipe(rename(name + '.tinymce.min.js'))
               .pipe(uglify())
               .pipe(header(license, packageJson))
               .pipe(gulp.dest(dest))
    ;
}

function ckeditor(){
  return gulp.src('integrations/ckeditor.js')
               .pipe(concat(name + '.ckeditor.js'))
               .pipe(gulp.dest(dest))
               .pipe(rename(name + '.ckeditor.min.js'))
               .pipe(uglify())
               .pipe(header(license, packageJson))
               .pipe(gulp.dest(dest))
    ;
}

////////////////////////////////////////////////////////////////////////////////

function Less(){
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
}

function lint(){ //Not in use
  return gulp.src(sources)
            .pipe(jslint({
           //  global: ['XMLHttpRequest']
            }))
            .pipe(jslint.reporter('default', {}))
}

function lintAdvanced(){ //Not in use
  return gulp.src(sources.concat(['./generated_src/highed.meta.options.advanced.js']))
         .pipe(jslint({
        //  global: ['XMLHttpRequest']
         }))
         .pipe(jslint.reporter('default', {}))
  ;
}

function moveStandalone(){
  return gulp.src([__dirname + '/res/standalone.html'])
         .pipe(gulp.dest(dest))
  ;
}

function minify(){
  return gulp.src(sources)
               .pipe(concat(name + '.js'))
               .pipe(gulp.dest(dest))
               .pipe(rename(name + '.min.js'))
               .pipe(uglify())
               .pipe(header(license, packageJson))
               .pipe(gulp.dest(dest))
               .pipe(gulp.dest(electronDest))
               .pipe(gulp.dest(wpPluginDest))
    ;
}


gulp.task('minify-advanced', () => gulp.series(bakeAdvanced, Less, function () {
    return gulp.src('./generated_src/highed.meta.options.advanced.js')
               .pipe(concat(name + '.advanced.js'))
               .pipe(gulp.dest(dest))
               .pipe(rename(name + '.advanced.min.js'))
               .pipe(uglify())
               .pipe(header(license, packageJson))
               .pipe(gulp.dest(dest))
               .pipe(gulp.dest(electronDest))
               .pipe(gulp.dest(wpPluginDest))
    ;
}));

function plugins(){
  return gulp.src('plugins/*.js')
               .pipe(uglify())
               .pipe(header(license, packageJson))
               .pipe(gulp.dest(dest + 'plugins'))
               .pipe(gulp.dest(electronDest + 'plugins'))
               .pipe(zip(name + '.plugins.' + packageJson.version + '.zip'))
               .pipe(gulp.dest(buildDest))
    ;
}

////////////////////////////////////////////////////////////////////////////////

gulp.task('build-electron', () => gulp.series(Less, minify, updateDeps, function () {
    return gulp.src('')
               .pipe(electron({
                    src: './app',
                    packageJson: {
                        name: packageJson.name,
                        version: packageJson.version
                    },
                    release: './dist/electron',
                    cache: './cache',
                    version: 'v1.3.4',
                    packaging: true,
                    platforms: ['win32-ia32', 'darwin-x64', 'linux-x64'],
                    platformResources: {
                        darwin: {
                            CFBundleDisplayName: packageJson.name,
                            CFBundleIdentifier: packageJson.name,
                            CFBundleName: packageJson.name,
                            CFBundleVersion: packageJson.version,
                            "icon": 'res/logo.png'
                        },
                        win: {
                            "version-string": packageJson.version,
                            "file-version": packageJson.version,
                            "product-version": packageJson.version,
                            "icon": 'res/logo.ico'
                        }
                    }
               }))
               .pipe(gulp.dest(''))

    ;
}));

gulp.task('move-electron', () => gulp.series('build-electron', function () {
  return gulp.src([
            'dist/electron/v1.3.4/' + packageJson.name + '-' + packageJson.version + '-darwin-x64.zip',
            'dist/electron/v1.3.4/' + packageJson.name + '-' + packageJson.version + '-linux-x64.zip',
            'dist/electron/v1.3.4/' + packageJson.name + '-' + packageJson.version + '-win32-ia32.zip'
          ])
          .pipe(gulp.dest(buildDest))
}));

////////////////////////////////////////////////////////////////////////////////

function Electron() {
  gulp.series(updateDeps, 'build-electron', 'move-electron');
}

gulp.task('default', function (done) {
    gulp.series(buildConfig, minify, tinymce, ckeditor, Less, moveStandalone, updateDeps, plugins, 'wordpress', 'zip-standalone', 'zip-dist', 'zip-standalone-nominify', 'zip-tinymce', 'zip-ckeditor', modules);
    done();
});

function withAdvanced() {
  gulp.series('minify-advanced', 'zip-dist-advanced', ckeditor, tinymce, Less, plugins, 'wordpress', 'zip-standalone', 'zip-dist', 'zip-standalone-nominify', 'zip-tinymce', 'zip-ckeditor');
  done();
}

function all(){
  gulp.series('default', Electron, withAdvanced, localization, 'complete');
}