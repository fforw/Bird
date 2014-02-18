
var React = require("react");
var gfx = require("./gfx");

var pj = require("pajamas");

var Q = require("q");

var getScreenBBox = require("../compat/getScreenBBox");
var innerSVG = require("../compat/innersvg");

var Helper;

var OFF_SCREEN_OFFSET = -10000;

function mapToInnerSVG(v)
{
    var group = document.createElement("g");
    group.appendChild(v.cloneNode(true));
    return group.innerHTML;
}

function AnimationSheet(helper)
{
    var def = helper.props.def;

    var xCount = Math.floor(def.width / def.tileWidth);
    var yCount = Math.floor(def.height / def.tileHeight);

    this.name = def.name;
    this.def = def;
    this.xCount = xCount;
    this.yCount = yCount;

    var rows = new Array(yCount);

    for (var y = 0; y < yCount; y++)
    {
        var row = new Array(xCount);
        var found = false;
        for (var x = 0; x < xCount; x++)
        {
            var value = helper.getCell(x, y);
            if (value)
            {
                //console.debug(value);

                row[x] = value;
                found = true;
            }
        }

        if (found)
        {
            rows[y] = row;
        }
    }

    this.rows = rows;
}



AnimationSheet.prototype = {
    get: function(x,y)
    {
        if (y === undefined)
        {
            var off = x;
            y = (off / this.xCount)|0;
            x = off - y* this.xCount;
        }

        var row = this.rows[y];
        return row && row[x];
    }
};

var Helper = React.createClass({
    componentDidMount: function (root)
    {
        this.sheet = new AnimationSheet(this);
    },

    getCell: function(x,y)
    {

        var def = this.props.def;
        var svgElem = this.getDOMNode();

        var cellAABB = new gfx.AABB(x * def.tileWidth + OFF_SCREEN_OFFSET, y * def.tileHeight, def.tileWidth, def.tileHeight)

        var elems = [];

        var kids = this.getDOMNode().firstChild.childNodes;
        for (var i = 0; i < kids.length; i++)
        {
            var kid = kids[i];
            if (kid.nodeType !== Node.TEXT_NODE)
            {
                var aabb = getScreenBBox(kid);

                if (cellAABB.contains(aabb.x, aabb.y) ||
                    cellAABB.contains(aabb.x + aabb.width, aabb.y) ||
                    cellAABB.contains(aabb.x + aabb.width, aabb.y + aabb.height) ||
                    cellAABB.contains(aabb.x, aabb.y + aabb.height) )
                {
                    elems.push(kid);
                }
            }
        }

        if (!elems.length)
        {
            return null;
        }

        return "<g transform=\"translate(" + ( -cellAABB.x + OFF_SCREEN_OFFSET ) + ", " + ( -cellAABB.y ) + ") " + this.props.baseTransform + "\"> " + elems.map(mapToInnerSVG).join("") + "</g>";
    },

    render: function ()
    {
        return React.DOM.svg({ version: "1.1", width: 800, height: 800, dangerouslySetInnerHTML: { __html: this.props.svg } });
    }
});

// Cross-browser xml parsing
function parseXML( data )
{
    var xml, tmp;
    if ( !data || typeof data !== "string" ) {
        return null;
    }

    // Support: IE9
    try {
        tmp = new DOMParser();
        xml = tmp.parseFromString( data, "text/xml" );
    } catch ( e ) {
        xml = undefined;
    }

    if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
        throw new Error ( "Invalid XML: " + data );
    }
    return xml;
}

function clean(xml)
{
    // cleanup directive, comments and unneeded namespaces inkscape leaves in our document
    return xml.replace(/((xmlns:sodipodi|xmlns:inkscape|inkscape:[^=]+|sodipodi:[^=]+)="[^"]*"\s*)|(<!--.*-->)|(<\?.*\?>)/g,"");
}

AnimationSheet.load = function(uri, def)
{
    var defer = Q.defer();
    pj({
        url: uri,
        dataType: "text"
    }).then(function(txt)
        {
            var xml = clean(txt);

            var layer = parseXML(txt).querySelector("#layer1");
            var baseTransform = layer.getAttribute("transform");
            var src = "<g transform=\"" + baseTransform + "\">" + layer.innerSVG + "</g>";

            //console.debug("src : %o", src);

            var div = document.createElement("div");
            div.style.position = "absolute";
            div.style.left = OFF_SCREEN_OFFSET + "px";
            div.style.top = 0 + "px";

            document.body.appendChild(div);

            var helper = Helper({
                svg: src ,
                def: def,
                baseTransform :  baseTransform
            });

            React.renderComponent(helper , div, function ()
            {
                defer.resolve(helper.sheet);
                React.unmountComponentAtNode(div);
            });
        })
        .done();

    return defer.promise;
};


module.exports = AnimationSheet;