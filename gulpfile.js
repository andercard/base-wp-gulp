// iniciamos las dependencias de gulp
const gulp = require('gulp'),
      sass = require('gulp-sass'),
      browserSync = require('browser-sync'),
      reload      = browserSync.reload,
      notify = require("gulp-notify"),
      sassLint = require('gulp-sass-lint'),
      babel = require('gulp-babel'),
      concat = require('gulp-concat'),
      autoprefixer = require('gulp-autoprefixer'),
      uglify = require('gulp-uglify'),
      image = require('gulp-image'),
      rename = require('gulp-rename'),
      cleanCss = require('gulp-clean-css'),
      postcss = require('gulp-postcss'),
      cssnano = require('gulp-cssnano'),
      plumber = require('gulp-plumber'),
      pump = require('pump');

// rutas
const ruta = {
        src: 'src',
        bwc: 'bower_components',
        nm: 'node_modules'
      };

// archivos
const files= {
        css: [
          `${ruta.nm}/bootstrap/dist/css/bootstrap.min.css`,
          `${ruta.nm}/slick-carousel/slick/slick.css`,
          `${ruta.nm}/slick-carousel/slick/slick-theme.css`,
          `${ruta.src}/css/font-awesome.css`
        ],
        js: [
          `${ruta.nm}/tether/dist/js/tether.min.js`,
          `${ruta.nm}/bootstrap/dist/js/bootstrap.min.js`,
          `${ruta.nm}/slick-carousel/slick/slick.min.js`,
          `${ruta.src}/jsVendor/main.js`
        ],
        staticFont : [
          `${ruta.nm}/slick-carousel/slick/fonts/*.*`
        ]
      };

// configuracion
const  opts = {
        sass : {
          outputStyle: 'compressed'
        },
        es6 : { 
          presets : ['es2015','es2016','es2017']
        },
        autoprefixer : {
          browsers: ['last 2 version','> 1%'],
          grid: true,
          cascade : false
        },
        rename: {
          suffix: '.min'
        },
        uglify: {
          compress: true
        },
        cleancss: {
          rebase: false
        }
      };


// Server
gulp.task('server', function() {
  var files = [
      './**/*.php',
      './js/**/*.js'
      ];
  browserSync.init(files, {
      proxy: "localhost:8080/guia_wordpress",
      port: 8080,
      online: true 
  });
});

gulp.task( 'servidor', [ 'server'] );

// sass
gulp.task('sass', () => {
  gulp
    .src( `${ruta.src}/scss/*.scss`)
    .pipe(plumber())
    .pipe( sassLint() )
    .pipe( sass( opts.sass ) )
    .pipe( cleanCss(opts.cleancss))
    .pipe( autoprefixer(opts.autoprefixer))
    .pipe( cssnano())
    .pipe( gulp.dest( `./` ) )
    .pipe(reload({stream:true}))
    .pipe( notify( { message: '"sass" completo! <%= file.relative %>', onLast: true } ) )
});

// css
gulp.task('vendorcss', () => {
  gulp
    .src( files.css )
    .pipe( autoprefixer(opts.autoprefixer))
    .pipe( cleanCss(opts.cleancss))
    .pipe( concat( 'vendorcss.min.css' ) )
    .pipe( gulp.dest( `./css` ) )
    .pipe( notify( { message: 'vendor Css completo! <%= file.relative %>', onLast: true } ) )
});

gulp.task('css', ['sass', 'vendorcss']);

// js
gulp.task('es6', (cb) =>{
  pump([
    gulp.src( `${ruta.src}/js/**/*.js` ),
    babel( opts.es6 ),
    uglify({compress: true}),
    gulp.dest( `./js` ),
    notify({ message: 'es6 completo! <%= file.relative %>', onLast: true })
  ],
    cb
  )
});

gulp.task('vendorjs', (cb) =>{
  pump([
    gulp.src(files.js),
    concat('vendorjs.min.js'),
    gulp.dest( `./js` ),
    notify({ message: 'Vendor Js completo! <%= file.relative %>', onLast: true })
  ],
    cb
  )
});

gulp.task('js', ['es6', 'vendorjs']);

// optimizar imagenes
gulp.task('image', function () {
  gulp
    .src(`${ruta.src}/images/**/*.+(png|jpg|jpeg|gif)`)
    .pipe(image())
    .pipe( gulp.dest(`./images`) )
});

//enviar archivos font
gulp.task('font', () => {
  gulp
    .src(files.staticFont)
    .pipe( gulp.dest( `./fonts`) );
});


gulp.task( 'revisar', [ 'sass', 'es6' ], function () {
  gulp.watch( `${ruta.src}/scss/**/*.scss`, [ 'sass' ] );
  gulp.watch( `${ruta.src}/js/**/*.js`, [ 'es6' ] );
});


gulp.task( 'default', [ 'css', 'js', 'server', 'revisar'] );