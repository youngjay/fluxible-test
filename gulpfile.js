var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var through = require('through2');
var _ = require('lodash');
var glob = require('glob');
var pather = require('path');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');

var TEMP_BOOTSTRAP_FOLDER = './build';
var ENTRY_FOLDER = './entry';

gulp.task('entry', function() {
    var SCRIPT_CONTENT_TEMPLATE = _.template('require("<%=clientPath%>")(require("<%=componentPath%>"))');

    return gulp.src(ENTRY_FOLDER + '/**/*.js')
        .pipe(through.obj(function(file, enc, cb) {     
            var relative = pather.relative(file.path, ENTRY_FOLDER);

            file.contents = new Buffer(SCRIPT_CONTENT_TEMPLATE({
                clientPath: pather.join(relative, './client'),
                componentPath: pather.join(relative, ENTRY_FOLDER, file.relative)
            }));
            this.push(file);
            cb();
        }))
        .pipe(gulp.dest(TEMP_BOOTSTRAP_FOLDER))
});


var files = glob.sync(ENTRY_FOLDER + '/**/*.js');

files.forEach(function(file) {
    var customOpts = {
      entries: [file],
      transform: [reactify]
    };

    var opts = _.assign({}, watchify.args, customOpts);

    var b = watchify(browserify(opts));

    gulp.task(file, ['entry'],  bundle); 

    b.on('update', function() {
        bundle();
    }); 
    b.on('log', gutil.log);

    function bundle() {
      return b.bundle()

        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))     
        .pipe(source(file.replace(ENTRY_FOLDER, '.'))) 
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        .pipe(gulp.dest('./public'));
    }
});


gulp.task('build', files);

gulp.task('default', ['build']);


