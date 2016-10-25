const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();

gulp.task('styles', () => {
  return gulp.src('public/styles/*.css')
    .pipe($.sourcemaps.init())
    .pipe($.autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'] }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('public/.tmp/styles'))
});

gulp.task('scripts', () => {
  return gulp.src('public/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('public/.tmp/scripts'))
});

function lint(files, options) {
  return gulp.src(files)
    .pipe($.eslint(options))
    .pipe($.eslint.format())
}

gulp.task('lint', () => {
  return lint('public/scripts/**/*.js', {
      fix: true
    })
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('public/*.html')
    .pipe($.useref({ searchPath: ['public/.tmp', 'public'] }))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({ safe: true, autoprefixer: false })))
    .pipe($.if('*.html', $.htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest('public/dist'));
});

gulp.task('images', () => {
  return gulp.src('public/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('public/dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
      .concat('public/fonts/**/*'))
    .pipe(gulp.dest('public/.tmp/fonts'))
    .pipe(gulp.dest('public/dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'public/*',
    '!public/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('public/dist'));
});

gulp.task('clean', del.bind(null, ['public/.tmp', 'public/dist']));

gulp.task('cache', del.bind(null, 'public/.tmp'));

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('public/dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('default', () => {
  runSequence('clean', 'build', 'cache');
});
