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
var factor = require('factor-bundle');
var concat = require('concat-stream');
var crypto = require('crypto');
var pather = require('path');
var tap = require('gulp-tap');
var through = require('through2');

var ENTRY_PATH = './entry';
var OUTPUT_PATH = pather.resolve('./public');
var CLIENT_BOOTSTRAP_MODULE = './client';
var FILE_ENDCODING = 'utf8'
var BROWSERIFY_TRANSFORMS = [
    [reactify, {"es6": true}]
];
var PKG = require('./package.json');
var STATIC_MAPPING_FILE = '.static-mapping.json';
var CounterAttack = require('counter-attack');

var ENTRIES = glob.sync(ENTRY_PATH + '/**/*.js');

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

var createBrowserifyWithWatchify = function(input) {
    return watchify(browserify(_.assign({}, watchify.args, {
        entries: [input],
        transform: BROWSERIFY_TRANSFORMS,
        debug: true
    })));
};

var createHash = function(bufferOrString) {
    return crypto.createHash('md5').update(bufferOrString.toString(FILE_ENDCODING)).digest('hex');
};

var setScriptMapping = function(scriptMapping) {
    fs.writeFile(STATIC_MAPPING_FILE, JSON.stringify({
        script: scriptMapping
    }), function(err) {
        if (err) {
            gutil.log(err);
        } else {
            gutil.log(STATIC_MAPPING_FILE + ' created')
        }
    })
};

var watchEntryTasks = ENTRIES.map(function(entry) {
    var input = createEntryStream(entry);
    var b = createBrowserifyWithWatchify(input);

    var bundle = function() {
        return b.bundle()
            .pipe(source(entry.replace(ENTRY_PATH, '.'))) 
            .pipe(buffer()) 
            // .pipe(sourcemaps.init({loadMaps: true}))
            // .pipe(uglify())
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))    
            // .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(OUTPUT_PATH));
    };

    var taskName = 'watch[' + entry + ']';

    gulp.task(taskName, bundle);
    b.on('update', bundle);
    b.on('log', gutil.log);

    return taskName;
});



gulp.task('build css', function(done) {
    var cssEntries = PKG.css;
    if (cssEntries) {
        CounterAttack.build.minifyAndLocalizeCSS(cssEntries, OUTPUT_PATH, function() {
            console.log(arguments[1])
        })
    } else {
        done();
    }
});

gulp.task('js', function(done) {
    CounterAttack.build.generateFactorAndEntries(ENTRIES.map(createEntryStream), OUTPUT_PATH, function() {
        console.log(arguments);
    })
})


gulp.task('watch', watchEntryTasks);

gulp.task('default', ['watch']);