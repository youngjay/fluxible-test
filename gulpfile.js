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
var OUTPUT_PATH = './public';
var CLIENT_BOOTSTRAP_MODULE = './client';
var FILE_ENDCODING = 'utf8'
var BROWSERIFY_TRANSFORMS = [
    [reactify, {"es6": true}]
];
var PKG = require('./package.json');
var STATIC_MAPPING_FILE = '.static-mapping.json';

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

gulp.task('build js for deploy', function() {
    var COMMON_SCRIPT_NAME = 'common.js';

    var setMapping = (function() {
        var o = {};
        var allCount = ENTRIES.length + 1; /* 1 for COMMON_SCRIPT_NAME */

        return function(key, value) {
            o[key] = value;
            if (--allCount === 0) {
                setScriptMapping(o);
            }
        }
    })();

    var b = browserify({
        transform: BROWSERIFY_TRANSFORMS,
        entries: ENTRIES.map(createEntryStream)
    }).plugin(factor, {
        outputs: ENTRIES.map(function(entry) {
            return concat(function(body) {
                var hash = createHash(body);
                var dest = pather.join(OUTPUT_PATH, hash + '.js');
                fs.writeFile(dest, body, function(err) {
                    if (err) {
                        gutil.log('write script error:' + err)
                    } else {                     
                        setMapping(pather.relative(ENTRY_PATH, entry), pather.basename(dest));
                    }
                })
            })
        })
    })

    return b.bundle()
        .pipe(source(COMMON_SCRIPT_NAME))
        .pipe(buffer()) 
        .pipe(through.obj(function(file, enc, next) {
            var hash = createHash(file.contents);
            file.path = pather.join(file.path, '../', hash + '.js');
            setMapping(COMMON_SCRIPT_NAME, pather.basename(file.path));
            this.push(file);
            next();
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})

var rework = require('rework');
var url = require('rework-plugin-url');
gulp.task('build css', function(done) {
    var cssEntries = PKG.css;
    if (cssEntries) {
        cssEntries.forEach(function(entry) {
            if (!fs.existsSync(entry)) {
                done(entry + ' not exists');
                return;
            }
            var content = fs.readFileSync(entry, FILE_ENDCODING);
            rework(content).use(url(function(path) {
                if (path.indexOf('data') === -1) {
                    console.log(path)
                }
                return path;
            }))
        })
    } else {
        done();
    }

});


gulp.task('watch js entris', watchEntryTasks);

gulp.task('default', ['build css']);