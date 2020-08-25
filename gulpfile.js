//Author : Jobanpreet Singh
var gulp  = require('gulp'),
   jshint = require('gulp-jshint'),
   sourcemaps = require('gulp-sourcemaps'),
   uglify = require('gulp-uglify'),
   concat = require('gulp-concat'),
   minify = require('gulp-minify'),
   minifyCSS = require('gulp-minify-css'),
   rename = require('gulp-rename'),
   htmlmin = require('gulp-htmlmin'),
   inject = require('gulp-inject'),
   series = require('stream-series'),
   bowerFiles = require('main-bower-files'),
   mainBowerFiles = require('gulp-main-bower-files'),
   livereload = require('gulp-livereload'),
   connect = require('gulp-connect'),
   gulpif = require('gulp-if'),
   filter = require('gulp-filter'),
   templateCache = require('gulp-angular-templatecache'),
   clean = require('gulp-clean'),
   deleteLines  = require('gulp-delete-lines');

   var js, css, bjs, lib, templates;
   
gulp.task('default', function(){
  console.log('running default gulp task');
});

gulp.task('connect', function(){
  connect.server({
     root:'./dist/',
	 port:8080,
	 livereload:true
  })
});

gulp.task('removeScriptTag', function(){
  return gulp.src('public/index.html')
    .pipe(deleteLines({
      'filters': [
      /<script\s+src=/i
      ]
    }))
	.pipe(gulp.dest('./public'));
});

gulp.task('clean', function(){
  return gulp.src('public/Assets/js/templates.js', {read: false})
    .pipe(clean());
});

gulp.task('bower-js', function(){
   var jsfilter = filter('**/**/*.js', {restore:true})
   return (bjs = gulp.src('./bower.json')
   .pipe(mainBowerFiles())
   .pipe(jsfilter)
   .pipe(uglify())
   .pipe(concat('vendor.js'))
   .pipe(rename('vendor.js'))
   .pipe(gulp.dest('dist/Assets/js')));
});

gulp.task('js', function(){
   return (js = gulp.src('public/Assets/js/**/*.js')
   .pipe(concat('app.js'))
   .pipe(uglify())
   .pipe(rename('app.js'))
   .pipe(gulp.dest('dist/Assets/js')));
});

gulp.task('lib', function(){
   return (lib = gulp.src('public/Assets/lib/**/*.js')
   .pipe(concat('plugin.js'))
   .pipe(uglify())
   .pipe(rename('plugin.js'))
   .pipe(gulp.dest('dist/Assets/js')));
});

gulp.task('css', function(){
   return (css = gulp.src('public/Assets/css/**/*.css')
   .pipe(concat('app.css'))
   .pipe(minifyCSS())
   .pipe(rename('app.css'))
   .pipe(gulp.dest('dist/Assets/css')));
});

gulp.task('pages', function(){
   gulp.src('public/Assets/pages/**/*.html')
   .pipe(gulp.dest('dist/Assets/pages'));
});

gulp.task('images', function(){
   return (gulp.src('public/Assets/img/**/*')
   .pipe(gulp.dest('dist/Assets/img')));
});

gulp.task('emoji_images', function(){
   return (gulp.src('public/Assets/lib/emoji/basic/images/*.png')
   .pipe(gulp.dest('dist/Assets/lib/emoji/basic/images')));
});

gulp.task('font', function(){
   return (gulp.src('public/Assets/font/**/*')
   .pipe(gulp.dest('dist/Assets/font')));
});

gulp.task('template', function(){
  return (templates = gulp.src('public/Assets/pages/**/*.html')
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(templateCache('templates.js', { module: 'myapp' }))
  .pipe(uglify())
  .pipe(gulp.dest('dist/Assets/js')))
})

gulp.task('index', function(){
   return gulp.src('public/index.html')
   .pipe(inject(series( bjs, lib, js, templates, css), { ignorePath: 'dist' }))
   .pipe(rename('index.html'))
   .pipe(gulp.dest('dist'));
});

gulp.task('watch', function(){
  livereload.listen();
  gulp.watch(['public/Assets/js/**/*.js']).on('change', livereload.changed);
  gulp.watch('public/Assets/js/**/*.js', ['js'])
})

gulp.task('builddist', ['bower-js', 'lib', 'js', 'css',  'images', 'emoji_images', 'font', 'template', 'index'],function(){
   console.log('builddist completed');
});

gulp.task('build',['clean', 'removeScriptTag'], function(){
  gulp.start('builddist');
});

gulp.task('serve', ['connect', 'watch'], function(){
  console.log('serve completed');
});

//For development
gulp.task('dev', ['dev_template', 'dev_bower', 'dev_server', 'dev_watch'], function(){
  console.log('development completed');
});

gulp.task('dev_template', function(){
  return (templates = gulp.src('public/Assets/pages/**/*.html')
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(templateCache('templates.js', { module: 'myapp' }))
  .pipe(uglify())
  .pipe(gulp.dest('public/Assets/js')));
})

gulp.task('dev_bower', function(){
 var wiredep = require('wiredep').stream;
 gulp.src('./public/index.html')
 .pipe(wiredep())
 .pipe(inject(series(gulp.src('./public/Assets/lib/**/*.js', {read: false}), gulp.src('./public/Assets/js/**/*.js', {read: false}), templates),{ignorePath:'/public'}))
 .pipe(inject(gulp.src('./public/Assets/css/**/*.css', {read: false}),{ignorePath:'/public'}))
 .pipe(gulp.dest('./public'))
});

gulp.task('dev_server', function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    // .use(require('connect-livereload')({ port: 35729 }))
    //.use(serveStatic('.tmp'))
    .use(serveStatic('public'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('public'));
  //Front end will run on 9000 port ->http://localhost:9000
  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('dev_watch', function(){
 // livereload.listen();
  gulp.watch(['public/Assets/pages/**/*.html']).on('change', livereload.changed);
  gulp.watch('public/Assets/pages/**/*.html', ['dev_template'])
})