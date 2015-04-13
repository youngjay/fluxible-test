// TODO 
// place as a npm module

var React = require('react');
var App = require('./app');
var queryString = require('querystring');


var dehydratedState = window.App; // sent from the server
window.React = React; // for chrome dev tool support

var mergeMethods = function(one, two) {
    return function mergedResult() {
        var a = one.apply(this, arguments);
        var b = two.apply(this, arguments);        
    };
}

module.exports = function(page) {
    var action = page.action;
    var component = page.component;

    if (action && page.async) {
        component.prototype.componentDidMount = mergeMethods(component.prototype.componentDidMount, function() {
            this.executeAction(action, queryString.parse(location.search.replace(/^\?/, '')))
        })
    }

    var app = App(component);

    app.rehydrate(dehydratedState, function (err, context) {
        window.context = context;

        if (err) {
            throw err;
        }

        React.render(context.createElement(), document.getElementById('main'));
    });
}


