/** @jsx React.DOM */

var Q = require("q");
var AnimationSheet = require("./animation-sheet");

var requestAnimationFrame = require("../compat/requestAnimationFrame");

var React = require("react");

var Screen = require("./screen");
var Animated = require("./animated");

var gfx  = require("./gfx");

function mapSheets(sheets)
{
    var sheetsMap = {};

    sheets.forEach(function (sheet)
    {
        sheetsMap[sheet.name] = sheet;
    });

    //console.debug("sheetsMap : %o", sheetsMap);

    return sheetsMap;
}

function AnimationObject(props)
{
    for (var prop in props)
    {
        if (props.hasOwnProperty(prop))
        {
            this[prop] = props[prop];
        }
    }

    console.debug("created %o", this);
}

function mapToAnimated(object, index)
{

    return Animated({
        key: "anim-" + index,
        sheet: this.props.sheets[object.sheet],
        aabb: object.aabb,
        position: object.position

    });
}

var AnimationComponent = React.createClass({

    adaptToSize: function (ev)
    {
        this.forceUpdate();
    },

    componentDidMount: function (root)
    {
        if (this.props.opts.fullScreen)
        {
            window.addEventListener("resize", this.adaptToSize, true);
        }

    },
    componentWillUnmount: function ()
    {
        if (this.props.opts.fullScreen)
        {
            window.removeEventListener("resize", this.adaptToSize, true);
        }
    },

    render: function()
    {
        var height;
        var width;
        var opts = this.props.opts;
        if (opts.fullScreen)
        {
            width = window.innerWidth;
            height = window.innerHeight;
        }
        else
        {
            width = opts.width || 800;
            height = opts.height || 600;
        }

        var kids = this.props.objects.map(mapToAnimated, this)

        return (
            <Screen
            aabb={ new gfx.AABB(0,0, width, height) }
            width={ width }
            height={ height } >
                { kids }
            </Screen>
            );
    }

});

function Animation(opts)
{

    this.opts = opts;
    this.objects = [];

    var loopDefer = Q.defer();

    var sheetsDef = opts.sheets;

    var promises = [];
    for (var i = 0; i < sheetsDef.length; i++)
    {
        var def = sheetsDef[i];
        var name = def.name;

        promises[i] = AnimationSheet.load("media/" + name + ".svg", def);
    }

    promises.push(loopDefer.promise);

    var self = this;

    Q.all(promises).then(function (sheets)
    {
        var simulationFn = sheets.pop();
        self.sheetsMap = mapSheets(sheets);

        var start = new Date().getTime();
        var last = start - 1000 / 60;

        var animationLoop = function ()
        {
            var now = new Date().getTime();
            var time = now - start;
            var delta = now - last;

            simulationFn.call(self, time, delta);

            last = now;

            self.animationComponent.setProps({
                objects: self.objects
            });

            if (!self.stopped)
            {
                requestAnimationFrame(animationLoop);
            }
        };

        window.addEventListener("keydown", function(ev){
            if (ev.keyCode == 27)
            {
                self.stopped = true;
            }
        }, false);

        self.animationComponent = <AnimationComponent sheets={ self.sheetsMap  } objects={ self.objects } opts={ self.opts } />;
        React.renderComponent( self.animationComponent, document.getElementById("animation-container"), animationLoop);

    }).fail(function (error)
    {
        console.error(error);
        throw new Error("Error loading SVGs");

    }).done();

    this.loopDefer = loopDefer;
}

Animation.prototype = {
    createObject: function(opts)
    {
        var obj = new AnimationObject(opts);
        this.objects.push(obj)
        return obj;
    },
    run: function(loop)
    {
        if (typeof loop !== "function")
        {
            throw new Error("Not a function");
        }

        this.loopDefer.resolve(loop);
    }
}

module.exports = Animation;