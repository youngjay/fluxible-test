require('node-jsx').install({extension: '.jsx'})
var express = require('express');
// var favicon = require('serve-favicon');
var serialize = require('serialize-javascript');
var bodyParser = require('body-parser');
// var cookieParser = require('cookie-parser');
// var csrf = require('csurf');
var React = require('react');
// var through = require('through2');
var pather = require('path');
// var http = require('http');

var server = express();
// server.set('state namespace', 'App');
// server.use(favicon(__dirname + '/../favicon.ico'));
server.use('/public', express.static(__dirname + '/public'));
// server.use(cookieParser());
server.use(bodyParser.json());
// server.use(csrf({cookie: true}));

var HtmlComponent = React.createFactory(require('./component/html.jsx'));

// var ScriptBuilder = require('./script-builder');
var PageBuilder = require('fluxible-page-builder');

var fs = require('fs');

// var scriptBuilder = new ScriptBuilder({
//     basePath: '/script',
//     entryPath: './entry',
//     dist: './build',
//     bootstrapFile: './client'
// });

var App = require('./app')

var getScriptSrcs = process.env.PRD ? (function() {
    var PKG = require('./package.json');
    var STATIC_MAPPING_FILE = pather.resolve('.static-mapping.json');

    if (!fs.existsSync(STATIC_MAPPING_FILE)) {
        throw new Error('static-mapping file is required in product env');
    }

    var staticMapping = require(STATIC_MAPPING_FILE);
    var staticScriptMapping = staticMapping.script;


    return function(path) {
        return ['/common.js', path + '.js'].map(function(name) {
            return '/public/' + staticScriptMapping[name.substring(1)]
        })

    }
})() : function(path) {
    return ['/public' + path + '.js']
}

var pageBuilder = new PageBuilder({
    entryPath: pather.resolve('./entry'),
    App: App,
    HtmlWrapper: HtmlComponent,
    getScriptSrcs: getScriptSrcs,
    getCSSes: function() {
        return [
            'public/css.all.34b50e9bd0eceff0dee3a0ee4dd1e5fa.css'
        ]
    }
})

var pigeonPlugin = require('./pigeon');

// server.use(scriptBuilder.getBasePath(), scriptBuilder.getMiddleware());
server.use(pigeonPlugin.getXhrPath(), pigeonPlugin.getMiddleware());
server.use(pageBuilder.getMiddleware());

var port = process.env.PORT || 3000;

server.listen(port, function() {
    console.log('server listening on port ' + port)
})
