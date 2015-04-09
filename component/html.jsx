var React = require('react');
var FluxibleMixin = require('fluxible').FluxibleMixin;

var Component = React.createClass({
    mixins: [FluxibleMixin],
    render: function() {
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />       
                    {this.props.csses.map(function(src) {
                        return <link rel="stylesheet" type="text/css" href={src}/>
                    })}
                </head>
                <body>
                    <div id="main" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
                    <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
                    {this.props.scripts.map(function(src) {
                        return <script src={src} defer key={src}></script>
                    })}
                </body>            
            </html>
        );
    }
});


module.exports = Component;
