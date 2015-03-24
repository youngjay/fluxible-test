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

var server = express();
server.set('state namespace', 'App');
// server.use(favicon(__dirname + '/../favicon.ico'));
server.use('/public', express.static(__dirname + '/build'));
server.use(cookieParser());
server.use(bodyParser.json());
server.use(csrf({cookie: true}));

var App = require('./app');
var HtmlComponent = React.createFactory(require('./component/html.jsx'));

var ScriptBuilder = require('./script-builder');
var builder = new ScriptBuilder({
    basePath: '/script',
    entryPath: './page',
    dist: './build',
    bootstrapFile: './client'
})


server.use(builder.getBasePath(), builder.getMiddleware());

server.use(function (req, res, next) {
    var path = req.path;

    var path

    try {
        page = require('./page' + path);
    } catch (e) {
        next();
    }

    var action = page.action;
    var component = page.component;


    var app = App(component);

    var context = app.createContext();

    context.executeAction(action, req.query, function(err) {
        if (err) {
            if (err.status && err.status === 404) {
                return next();
            }
            else {
                return next(err);
            }
        }


        var exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

        var Component = app.getComponent();
        var componentContext = context.getComponentContext();
        var html = React.renderToStaticMarkup(HtmlComponent({
            state: exposed,
            markup: React.renderToString(context.createElement()),
            context: componentContext,
            scripts: builder.getScriptSrcs(path)
        }));

        res.send(html);

    })

});

var port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);
