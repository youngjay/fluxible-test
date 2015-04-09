var React = require('react');
var FluxibleMixin = require('fluxible').FluxibleMixin;
var TerritoryStore = require('../store/territory');

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

    getState: function() {
        return this.getStore(TerritoryStore).data;
    },

    render: function() {
        return  <table className="ui celled striped table">
                    <thead>
                        <tr>
                            <th>
                                ID
                            </th>
                            <th>
                                Name
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.territories.map(function(territory) {
                            return  <tr key={territory.id}>
                                        <td>
                                            <a href={"/detail?id=" + territory.id}>{territory.id}</a>                                            
                                        </td>
                                        <td>{territory.territoryName}</td>
                                    </tr>
                        })}
                    </tbody>
                </table>
    }
});