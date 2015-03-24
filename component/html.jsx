/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var FluxibleMixin = require('fluxible').FluxibleMixin;

var Component = React.createClass({
    mixins: [FluxibleMixin],
    render: function() {
        return (
            <html>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, user-scalable=no" />
               
            </head>
            <body>
                <section id="todoapp" dangerouslySetInnerHTML={{__html: this.props.markup}}></section>
            </body>
            <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
            {this.props.scripts.map(function(src) {
                return <script src={src} defer key={src}></script>
            })}
            </html>
        );
    }
});


module.exports = Component;
