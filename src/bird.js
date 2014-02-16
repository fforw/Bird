/** @jsx React.DOM */

var React = require("react");
var Component = require("./other");

var container = document.getElementById("container");
console.debug("container : %o", container);

var component = React.renderComponent(Component(), container, function ()
{
    console.debug("Yep.");
});

