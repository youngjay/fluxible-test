/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
require('babel/register');
var express = require('express');
var favicon = require('serve-favicon');
var serialize = require('serialize-javascript');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var React = require('react');
var through = require('through2');
var pather = require('path');

var server = express();
server.set('state namespace', 'App');
// server.use(favicon(__dirname + '/../favicon.ico'));
server.use('/public', express.static(__dirname + '/public'));
server.use(cookieParser());
server.use(bodyParser.json());
// server.use(csrf({cookie: true}));

var HtmlComponent = React.createFactory(require('./component/html.jsx'));

// var ScriptBuilder = require('./script-builder');
var PageBuilder = require('fluxible-page-builder');



// var scriptBuilder = new ScriptBuilder({
//     basePath: '/script',
//     entryPath: './entry',
//     dist: './build',
//     bootstrapFile: './client'
// });

var App = require('./app')

var pageBuilder = new PageBuilder({
    entryPath: pather.resolve('./entry'),
    App: App,
    HtmlWrapper: HtmlComponent,
    getScriptSrcs: function(path) {
        return ['/public' + path + '.js']
    },
    getCSSes: function() {
        return [
            '/public/semantic-ui/semantic.css'
        ]
    }
})

var pigeonPlugin = require('./pigeon');

// server.use(scriptBuilder.getBasePath(), scriptBuilder.getMiddleware());
server.use(pigeonPlugin.getXhrPath(), pigeonPlugin.getMiddleware());
server.use(pageBuilder.getMiddleware());

var port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);
