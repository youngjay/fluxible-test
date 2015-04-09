/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var Fluxible = require('fluxible');

var stores = [require('./store/territory')];
var plugins = [require('./pigeon')];

module.exports = function(Component) {
    var app = new Fluxible({
        component: React.createFactory(Component)
    });

    stores.forEach(function(store) {
        app.registerStore(store);
    })
    
    plugins.forEach(function(plugin) {
        app.plug(plugin);
    })

    return app;
};
