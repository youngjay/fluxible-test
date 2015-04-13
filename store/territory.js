/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var normalize = function(territory) {
    if (territory.updateTime) {
        territory.updateTime = new Date(territory.updateTime);
    }
    
    return territory
};

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
        this.data.territories = territories.map(normalize);
        this.emitChange();
    },

    loadOne: function(territory) {
        this.data.territory = normalize(territory);
        this.emitChange();
    },
    
    dehydrate: function () {
        return this.data;
    },

    rehydrate: function (data) {
        data.territories = data.territories.map(normalize);
        data.territory = normalize(data.territory);
        this.data = data;
    }
});

