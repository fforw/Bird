/** @jsx React.DOM */

var React = require("react");
var gfx = require("./gfx");

var requestAnimationFrame = require("../compat/requestAnimationFrame");

var frameCount = 0;

function round(n)
{
    return Math.round(n * 1000) / 1000;
}

var Loading = React.createClass({


    getInitialState: function()
    {
        return {
            offset: new gfx.Vector(0,0),
            angle: 0
        };
    },
    redraw: function()
    {
        if (this.isMounted())
        {
            var a;

            var reset = (frameCount & 255) === 0;

            var offset = this.state.offset;
            var angle = this.state.angle;
            var delta = this.state.delta;
            var spin = this.state.spin;

            if (reset)
            {
                console.debug("reset");
                offset = new gfx.Vector(0,0)
                angle = - 22.5 + Math.random() * 45;

                spin = -0.125 + Math.random() * 0.25;

                var a = Math.random() * Math.PI * 2;
                delta = new gfx.Vector(Math.cos(a), Math.sin(a)).scale(0.25);
            }
            else
            {
                offset = offset.copy().add(delta);
                angle += spin;
            }

            this.setState({
                offset: offset,
                angle: angle,
                delta: delta,
                spin: spin
            })


            requestAnimationFrame(this.redraw)
            frameCount++;
        }
    },

    componentDidMount: function()
    {
        requestAnimationFrame(this.redraw);
    },

    render: function ()
    {
        var styles = {
            fontSize: "24px",
            fontWeight: "bold"
        };

        var pos = this.props.pos.copy().add(this.state.offset);
        var angle = round(this.state.angle);

        return (

            <g transform={ "translate(" + pos.x + ", " + pos.y + ") rotate( " + angle + ", 138 , 0)" }>
                <text className="loading">
                    loading..
                </text>
            </g>
        );
    }
});

module.exports = Loading;
