const gulp = require("gulp");
const pug = require("gulp-pug");

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const sourcemaps = require('gulp-sourcemaps');
const rimraf = require('rimraf');

const browserSync = require("browser-sync").create();

const path = {
    root: "./build/",
    pug: {
        src: "./src/pages/*.pug",
        watch: [
            "./src/pages/**/*.pug"
        ],
        build: "build"
    },
    styles: {
        src: "./src/styles/app.{css,scss,sass}",
        watch: [
            "./src/styles/**/*.{css,scss,sass}",
        ],
        build: "build/css"
    },
    images: {
        src: "./src/img/**/*.{jpg,jpeg,png,gif,tiff,svg}",
        build: "build/img"
    },
    js: {
        src: "./src/js/**/*.js",
        build: "build/js"
    },
    fonts: {
        src: "./src/fonts/**/*.{woff,woff2,ttf,otf}",
        build: "build/fonts"
    }
};


gulp.task("pug:build", () => {
    return gulp.src(path.pug.src)
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest(path.pug.build))
        .pipe(browserSync.reload({stream: true}));
})

gulp.task('style:build', () => {
    return gulp.src(path.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            require('postcss-import'),
            require('postcss-prettify'),
            autoprefixer(),
        ]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.styles.build))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('image:build', () => {
    return gulp.src(path.images.src)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.images.build))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('js:build', () => {
    return gulp.src(path.js.src)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.js.build))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts:build', () => {
    return gulp.src(path.fonts.src)
        .pipe(gulp.dest(path.fonts.build))
});

gulp.task('watch', function (done) {
    gulp.watch(path.pug.watch, gulp.parallel("pug:build"));
    gulp.watch(path.styles.watch, gulp.parallel("style:build"));
    gulp.watch(path.js.src, gulp.parallel("js:build"));
    gulp.watch(path.images.src, gulp.parallel("image:build"));
    gulp.watch(path.fonts.src, gulp.parallel("fonts:build"));

    done();
});

gulp.task('webserver', function (done) {
    browserSync.init({
        server: {
            baseDir: path.root,
        },
        tunnel: true,
        host: 'localhost',
        port: 9000,
    });
    browserSync.watch(path.root).on('change', browserSync.reload)
    done();
});

gulp.task('clean', function (cb) {
    rimraf(path.root, cb);
});

gulp.task('build', gulp.series(
    'clean',
    'pug:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
    )
);

gulp.task('dev', gulp.series('build', 'webserver', 'watch'));