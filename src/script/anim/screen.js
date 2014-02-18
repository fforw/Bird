/** @jsx React.DOM */

var React = require("react");
var gfx = require("./gfx");

/**
 * SVG screen
 */
var Screen = React.createClass({

    propTypes : {
        aabb: React.PropTypes.instanceOf(gfx.AABB).isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    },

    getViewBoxString: function ()
    {
        var screen = this.props.aabb;
        return screen.x + " " + screen.y + " " + screen.width + " " + screen.height;
    },

    render: function ()
    {
        return (
            <svg
                version="1.1"
                width={ this.props.width }
                height={ this.props.height }
                viewBox={ this.getViewBoxString() }>
                { this.props.children }
            </svg>
        );
    }
});

module.exports = Screen;
