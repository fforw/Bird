/** @jsx React.DOM */

var React = require("react");

window.onload = function ()
{
    var container = document.getElementById("container");
    console.debug("container : %o", container);

    var component = React.renderComponent(<div className="test"/>, container, function ()
    {
        console.debug("Yep.");
    });
}

