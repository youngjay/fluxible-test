/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global document, window */
'use strict';
var React = require('react');
var App = require('./app');


var dehydratedState = window.App; // sent from the server
window.React = React; // for chrome dev tool support

module.exports = function(page) {
    var action = page.action;
    var component = page.component;

    var app = App(component);


    app.rehydrate(dehydratedState, function (err, context) {
        window.context = context;

        if (err) {
            throw err;
        }

        React.render(context.createElement(), document.getElementById('main'));
    });
}


