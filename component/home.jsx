
var React = require('react');
var FluxibleMixin = require('fluxible').FluxibleMixin;
var PermissionStore = require('../store/permission');

var searchAction = require('../action/permissions');

var queryString = require('query-string');

module.exports = React.createClass({
    mixins: [FluxibleMixin, React.addons.LinkedStateMixin],
    statics: {
        storeListeners: [PermissionStore]
    },

    getInitialState: function () {
        return this.getState();
    },

    getState: function() {
        var store = this.getStore(PermissionStore);

        return store.getData();
    },

    onChange: function() {
        this.setState(this.getState());
    },

    search: function() {
        var query = {
            loginId: this.state.loginId
        };

        this.executeAction(searchAction, query)
        history.pushState(query, null, '?' + queryString.stringify(query))
    },

    render: function() {
        return <div>
            <a href="/about/about">about</a>
            <div>home1</div>
            <div>{this.state.permissions}</div>
            <div>费婷：-50980</div>
            <div>杨杰：-21696</div>
            <input valueLink={this.linkState('loginId')} />

            <button className="ui primary button" onClick={this.search}>search2</button>
        </div>
    }
});