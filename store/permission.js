/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;


module.exports = createStore({
    storeName: 'Permission',
    handlers: {
        'FETCH_PERMISSIONS': 'updatePermissions'
    },
    initialize: function () {
        this.permissions = [];
        this.loginId = null;
    },
    getData: function() {
        return {
            permissions: this.permissions,
            loginId: this.loginId
        }
    },
    updatePermissions: function (data) {
        this.permissions = data.permissions;
        this.loginId = data.loginId;
        this.emitChange();
    },
    dehydrate: function () {
        return this.getData();
    },
    rehydrate: function (data) {
        this.permissions = data.permissions;
        this.loginId = data.loginId;
    }
});

