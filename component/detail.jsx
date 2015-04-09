var React = require('react');
var FluxibleMixin = require('fluxible').FluxibleMixin;
var _ = require('lodash')

var TerritoryStore = require('../store/territory');

var updateTerritoryAction = require('../action/update-territory');


module.exports = React.createClass({ 
    mixins: [FluxibleMixin],

    statics: {
        storeListeners: [TerritoryStore]
    },

    onChange: function() {
        this.setState(this.getState())
    },

    getInitialState: function () {
        return this.getState();
    },

    getState: function () {
        return _.extend({}, this.getStore(TerritoryStore).data.territory);
    },

    onSubmit: function(e) {
        e.preventDefault();
        this.executeAction(updateTerritoryAction, this.state);
    },

    onTextChange: function(e) {
        this.setState({
            territoryName: e.target.value
        })
    },

    render: function() {
        return  <form className="ui form" onSubmit={this.onSubmit}>
                    <div className="field">
                        <label>Name</label>
                        <input type="text" value={this.state.territoryName} onChange={this.onTextChange} placeholder="战区名称"/>
                    </div>
                    <button className="ui submit button" type="submit">修改</button>
                    <a href="/list">返回列表</a>
                </form>
    }
});