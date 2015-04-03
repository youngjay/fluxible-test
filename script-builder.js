var browserify = require('browserify');
var reactify = require('reactify');
var mixin = require('mixin-class');
var _ = require('lodash');
var pather = require('path');
var fs = require('fs');
var through = require('through2');
var mkdirp = require("mkdirp")
var getDirName = require("path").dirname

var SCRIPT_CONTENT_TEMPLATE = _.template('require("<%=bootstrap%>")(require("<%=component%>"))');

module.exports = mixin(function(options) {
    this.options = _.extend({}, this.defaultOptions, options);
}, {
    defaultOptions: {
        basePath: '/script',
        entryPath: './entry',
        dist: './build',
        bootstrapFile: './client'
    },

    getBasePath: function() {
        return this.options.basePath;
    },

    getScriptSrcs: function(path) {
        return this.prefixBasePath([path]);
    },

    prefixBasePath: function(paths) {
        var basePath = this.getBasePath();

        return paths.map(function(path) {
            return pather.join(basePath, path);
        })
    },

    getMiddleware: function() {
        var self = this;

        return function(req, res, next) {
            var path = req.path;         

            var filePath = pather.resolve(pather.join(self.options.entryPath, path));

            if (fs.existsSync(filePath + '.js')) {

                self.createEntryFile(filePath, path, function(err, distFile) {
                    if (err) {
                        res.status(500).end(err);
                        return;
                    }     

                    res.setHeader('Content-Type', 'text/javascript')                    

                    var contents = [];

                    browserify({
                        transform: [reactify]
                    })
                    .add('./' +  pather.relative('./', distFile))
                    .bundle()
                    .pipe(res)

                })
            } else {
                res.status(404).end();
            }
        }
    },

    createEntryFile: function(filePath, path, callback) {
        var dist = pather.resolve(this.options.dist);
       
        var content = SCRIPT_CONTENT_TEMPLATE({
            bootstrap: pather.relative(pather.join(dist, path, '../'), this.options.bootstrapFile),
            component: pather.relative(pather.join(dist, path, '../'), filePath)
        });

        var distFile = pather.join(dist, path) + '.js';  

        mkdirp(getDirName(distFile), function(err) {
            if (err) {
                return callback(err);
            }

            fs.writeFile(distFile, content, 'utf-8', function(err) {
                if (err) {
                    return callback(err);
                }
                callback(null, distFile)
            })
        })    

        
    }
})