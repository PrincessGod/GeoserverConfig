const fs          = require('fs');
const path        = require('path');


const browserSync = require('browser-sync');
const gulp        = require('gulp');
const imagemin    = require('gulp-imagemin');
const insert      = require('gulp-insert');
const md          = require('gulp-remarkable');
const name        = require('gulp-rename');
const replace     = require('gulp-replace');


const srcpath = 'src';
const outpath = 'build';

const postPrepend = fs.readFileSync(path.join(__dirname, srcpath, 'postprepend.html'), 'utf8');
const postAppend  = fs.readFileSync(path.join(__dirname, srcpath, 'postappend.html'), 'utf8');

const titles = {
  install:    '安装GeoServer',
  cors:       '配置CORS',
  wmi_intro:  'Web管理界面简介',
  post_shape: '发布Shapefile图层',
  style:      'WAI中设置样式',
  style_udig: '使用uDig辅助样式设计',
};

// Tasks
gulp.task('copyDepends', () => gulp
  .src([`./${srcpath}/thirdparty/**`])
  .pipe(gulp.dest(`${path.join(__dirname, outpath)}/thirdparty`)));

gulp.task('copyImages', () => gulp
  .src([`./${srcpath}/images/**`])
  .pipe(imagemin([imagemin.optipng()], { verbose : true }))
  .pipe(gulp.dest(`${path.join(__dirname, outpath)}/images`)));

gulp.task('copyIndex', () => gulp
  .src([`./${srcpath}/index.html`])
  .pipe(gulp.dest(path.join(__dirname, outpath))));

gulp.task('buildPost', () => gulp
  .src(`./${srcpath}/post/*.md`)
  .pipe(md({
    remarkableOptions: {
      typographer: true,
      linkify:     true,
      html:        true,
    },
  }))
  .pipe(insert.wrap(postPrepend, postAppend))
  .pipe(name((filepath) => {
    filepath.dirname += '/post';
    // filepath.basename += '-goodbye';
    filepath.extname = '.html';
  }))
  .pipe(gulp.dest(path.join(__dirname, outpath))));

gulp.task('changeTitle', ['buildPost'], () => gulp
  .src(`./${outpath}/post/*.html`)
  .pipe(replace('--title--', function () {
    return `<title>${titles[this.file.relative.replace(/\.[^/.]+$/, '')] || 'GeoServer配置'}</title>`;
  }))
  .pipe(gulp.dest(`./${outpath}/post/`)));

gulp.task('md_watch', ['changeTitle'], browserSync.reload);

gulp.task('html_watch', ['copyIndex'], browserSync.reload);
// Watch
gulp.task('watch', () => {
  browserSync({
    server: {
      baseDir: path.join(__dirname, outpath),
    },
  });
  gulp.watch(`./${srcpath}/**/*.md`, ['md_watch']);
  gulp.watch(`./${srcpath}/index.html`, ['html_watch']);
});

// Default Task
gulp.task('default', ['changeTitle', 'copyDepends', 'copyIndex', 'copyImages']);
