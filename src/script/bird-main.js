/** @jsx React.DOM */
"use strict";

var Animation = require("./anim/animation");
var gfx  = require("./anim/gfx");

var anim = new Animation({
    sheets: [{
        name: "bird",
        width: 800,
        height: 800,
        tileWidth: 100,
        tileHeight: 100
    }],
    fullScreen: true
});

var bird = anim.createObject({
    sheet: "bird",
    aabb: new gfx.AABB(0,0, 100, 100),
    position: 0
});

var dx = 1;
var f = false;

anim.run(function(time, delta)
{
    f = !f;
    if (f)
    {
        bird.position = bird.position + dx;
        if (bird.position == 7 || bird.position == 0)
        {
            dx = -dx;
        }
    }

});
