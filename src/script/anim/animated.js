/** @jsx React.DOM */

var React = require("react");
var gfx = require("./gfx");
var AnimationSheet = require("./animation-sheet");


var Layer = React.createClass({
    render: function ()
    {
        var aabb = this.props.aabb;

        var styles = {
            opacity: this.props.opacity
        };

        var inner  = { "__html": this.props.svg };
        return (
            <g
                style={ styles }
                dangerouslySetInnerHTML={ inner }
            />
        );
    }

});

var Animated = React.createClass({

    propTypes: {
        sheet: React.PropTypes.instanceOf(AnimationSheet).isRequired,
        aabb: React.PropTypes.instanceOf(gfx.AABB).isRequired,
        position: React.PropTypes.number.isRequired
    },

    getInitialState: function()
    {
        var current = this.props.position;
        var drawn = {};
        drawn[current] = true;

        return {
            drawn: drawn
        };
    },

    componentWillReceiveProps: function ()
    {
        var drawn = this.state.drawn;

        var cell = this.props.position|0;
        var fraction = this.props.position - cell;

        drawn[cell] = true;
        if (fraction)
        {
            drawn[cell+1] = true;
        }

        this.setState({
            drawn: drawn
        })
    },

    render: function ()
    {
        var x, y , off, svg;

        var sheet = this.props.sheet;
        var aabb = this.props.aabb;

        var dir = 1;
        var frames = [];

        var cell = this.props.position|0;
        var fraction = this.props.position - cell;

        var drawn = this.state.drawn;

        for (off in  drawn)
        {
            var current = +off;
            svg = sheet.get(current);

            if (svg)
            {
                frames.push(
                    <Layer
                    key={"cell-" + current}
                    aabb={ this.props.aabb }
                    svg={ svg }
                    opacity={ current === cell ? 1 - fraction : current === cell + 1 ? fraction : 0 }
                    />
                );

            }
        }
        return (
            <g transform={"translate(" + (aabb.x) + ", " + (aabb.y) + ")"}>
                { frames }
            </g>
        );
    }
});

module.exports = Animated;
