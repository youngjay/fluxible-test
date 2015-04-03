var mixin = require('mixin-class');
var _ = require('lodash');
var pather = require('path');
var fs = require('fs');
var through = require('through2');
var mkdirp = require("mkdirp")
var getDirName = require("path").dirname
var React = require('react');
var serialize = require('serialize-javascript');
var prettyPrint = require('html').prettyPrint;

var App = require('./app');

/**
 * Removes a module from the cache
 */
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Runs over the cache to search for all the cached
 * files
 */
require.searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            callback(mod);
        })(mod);
    }
};

module.exports = mixin(function(options) {
    this.options = _.extend({}, this.defaultOptions, options);
}, {
    defaultOptions: {
        entryPath: './entry',
        getScriptSrcs: function() {
            return []
        },
        getCSSes: function() {
            return []
        },
    },

    // getBasePath: function() {
    //     return this.options.basePath;
    // },

    // getScriptSrcs: function(path) {
    //     return this.prefixBasePath([path]);
    // },

    // prefixBasePath: function(paths) {
    //     var basePath = this.getBasePath();

    //     return paths.map(function(path) {
    //         return pather.join(basePath, path);
    //     })
    // },

    getMiddleware: function() {
        var self = this;

        return function (req, res, next) {
            var path = req.path;

            var filePath = pather.resolve(pather.join(self.options.entryPath, path));

            if (fs.existsSync(filePath + '.js')) {
                require.uncache('./entry' + path);
                var page = require('./entry' + path);
                var action = page.action;
                var component = page.component;

                var app = App(component);

                var context = app.createContext();

                var render = function() {
                    var exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

                    var Component = app.getComponent();
                    var componentContext = context.getComponentContext();
                    var html = React.renderToStaticMarkup(self.options.HtmlWrapper({
                        state: exposed,
                        markup: React.renderToString(context.createElement()),
                        context: componentContext,
                        scripts: self.options.getScriptSrcs(path),
                        csses: self.options.getCSSes(path)
                    }));
                    res.send(prettyPrint(html));
                };

                if (action) {
                    context.executeAction(action, req.query, function(err) {
                        if (err) {
                            if (err.status && err.status === 404) {
                                return next();
                            }
                            else {
                                return next(err);
                            }
                        }
                        render();
                    })
                } else {
                    render()
                }

            } else {
                res.status(404).end();
            }
        }
    },

})