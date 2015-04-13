var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var _ = require('lodash');
var glob = require('glob');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');
var fs = require('fs');
var stream = require('stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var ENTRY_PATH = './entry';
var OUTPUT_PATH = './public';
var CLIENT_BOOTSTRAP_MODULE = './client';

var createEntryStream = function(entry) {
    var input = new stream.Readable({ objectMode: true });
    var drained = false;
    input._read = function(size) {
        if (!drained) {
            this.push('require("' + CLIENT_BOOTSTRAP_MODULE + '")(require("' + entry + '"))');
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
        transform: [
            [reactify, {"es6": true}]
        ],
        debug: true
    })));
};

var entries = glob.sync(ENTRY_PATH + '/**/*.js');

entries.forEach(function(entry) {
    var input = createEntryStream(entry);
    var b = createBrowserify(input);

    var bundle = function() {
        return b.bundle()
            .pipe(source(entry.replace(ENTRY_PATH, '.'))) 
            .pipe(buffer()) 
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))    
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(OUTPUT_PATH));
    };

    gulp.task(entry, bundle);
    b.on('update', bundle);
    b.on('log', gutil.log);
});

gulp.task('js', entries);

gulp.task('default', ['js']);