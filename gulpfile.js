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
var fs = require('fs');

var TEMP_BOOTSTRAP_FOLDER = './build';
var ENTRY_FOLDER = './entry';
var stream = require('stream');

var createEntryStream = function(entry) {
    var input = new stream.Readable({ objectMode: true });
    var drained = false;
    input._read = function(size) {
        if (!drained) {
            this.push('require("./client")(require("' + entry + '"))');
            drained = true;
        } else {
            this.push(null);
        }
    };
    return input;
};

var createBrowserify = function(input) {
    return watchify(browserify(_.assign({}, watchify.args, {
        entries: [input],
        transform: [reactify]
    })));
};

var entries = glob.sync(ENTRY_FOLDER + '/**/*.js');

entries.forEach(function(entry) {
    var input = createEntryStream(entry);
    var b = createBrowserify(input);

    var bundle = function() {
        return b.bundle()
            // log errors if they happen
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))     
            .pipe(source(entry.replace(ENTRY_FOLDER, '.'))) 
            // optional, remove if you don't need to buffer file contents
            .pipe(buffer())
            .pipe(gulp.dest('./public'));
    }

    gulp.task(entry, bundle);
    b.on('update', bundle);
    b.on('log', gutil.log);
});

gulp.task('js', entries);

gulp.task('default', ['js'])









// gulp.task('entry', function() {
//     var SCRIPT_CONTENT_TEMPLATE = _.template('require("<%=clientPath%>")(require("<%=componentPath%>"))');

//     return gulp.src(ENTRY_FOLDER + '/**/*.js')
//         .pipe(through.obj(function(file, enc, cb) {     
//             var relative = pather.relative(file.path, ENTRY_FOLDER);

//             file.contents = new Buffer(SCRIPT_CONTENT_TEMPLATE({
//                 clientPath: pather.join(relative, './client'),
//                 componentPath: pather.join(relative, ENTRY_FOLDER, file.relative)
//             }));
//             this.push(file);
//             cb();
//         }))
//         .pipe(gulp.dest(TEMP_BOOTSTRAP_FOLDER))
// });

// var files = glob.sync(TEMP_BOOTSTRAP_FOLDER + '/**/*.js');

// files.forEach(function(file) {
//     var customOpts = {
//       entries: [file],
//       transform: [reactify]
//     };

//     var opts = _.assign({}, watchify.args, {
//         entries: [file],
//         transform: [reactify]
//     });

//     var b = watchify(browserify(opts));

//     gulp.task(file, ['entry'],  bundle); 

//     b.on('update', bundle);

//     b.on('log', gutil.log);

//     function bundle() {
//         return b.bundle()
//             // log errors if they happen
//             .on('error', gutil.log.bind(gutil, 'Browserify Error'))     
//             .pipe(source(file.replace(ENTRY_FOLDER, '.'))) 
//             // optional, remove if you don't need to buffer file contents
//             .pipe(buffer())
//             .pipe(gulp.dest('./public'));
//     }
// });


// gulp.task('build', files);

// gulp.task('default', ['build']);


