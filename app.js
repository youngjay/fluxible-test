/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var Fluxible = require('fluxible');

module.exports = function(Component) {
    return new Fluxible({
        component: React.createFactory(Component)
    });
};
