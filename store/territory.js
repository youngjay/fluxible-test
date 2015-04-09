/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;


module.exports = createStore({
    storeName: 'Territory',
    handlers: {
        'LOAD_ALL': 'loadAll',
        'LOAD_ONE': 'loadOne'
    },

    initialize: function () {
        this.data = {
            territories: [],
            territory: {}
        }
    },

    loadAll: function(territories) {
        this.data.territories = territories;
        this.emitChange();
    },

    loadOne: function(territory) {
        this.data.territory = territory;
        this.emitChange();
    },
    
    dehydrate: function () {
        return this.data;
    },

    rehydrate: function (data) {
        this.data = data;
    }
});

