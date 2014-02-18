
var Dimension = function(width,height)
{
    this.width = width;
    this.height = height;
};

/**
 * Mutable Vector class. The operations not returning numbers are all destructive, change
 * the current instance in place. Use .copy() where appropriate.
 *
 * @param x ?number
 * @param y ?number
 * @constructor
 */
var Vector = function (x, y)
{
    if (typeof x === "object")
    {
        this.x = x.x;
        this.y = x.y;
    }
    else
    {
        this.x = x || 0;
        this.y = y || 0;
    }
};

Vector.prototype = {
    copy: function ()
    {
        return new Vector(this.x, this.y);
    },
    noNan: function(x,y, x2, y2)
    {
        if (this.x !== this.x || this.y !== this.y)
        {
            throw new Error("Vector is NaN ( was: "+ x + ", " + y + " and " + x2 + ", " + y2);
        }
        return this;
    },

    add: function (x,y)
    {
        if (x instanceof Vector)
        {
            this.x += x.x;
            this.y += x.y;
        }
        else
        {
            this.x += x;
            this.y += y;
        }
        return this.noNan();
    },
    subtract: function(x,y)
    {
        var xs = this.x;
        var ys = this.y;

        if (x instanceof Vector)
        {
            this.x -= x.x;
            this.y -= x.y;
        }
        else
        {
            this.x -= x;
            this.y -= y;
        }

        return this.noNan(xs,ys,x,y);
    },
    scale: function (s)
    {
        this.x *= s;
        this.y *= s;

        return this.noNan();
    },
    rotate90: function()
    {
        var tmp = this.x;
        this.x = -this.y;
        this.y = tmp;

        return this.noNan();
    },
    norm: function (len)
    {
        if (len === undefined)
        {
            len = 1;
        }

        var ratio = (len || 1) / this.len();
        return this.scale(ratio).noNan();
    },
    len: function ()
    {
        var x = this.x;
        var y = this.y;

        return Math.sqrt( x*x + y*y );
    },
    toString: function()
    {
        return "V(" + this.x + "," + this.y + ")";
    }

};

/**
 * Axis aligned bounding box of an element.
 *
 * @type {*}
 */
/**
 * Create a new AABB instance
 * @constructor
 *
 * @param x     lowest x
 * @param y     lowest y
 * @param w     width
 * @param h     height
 */
var AABB = function (x, y, w, h)
{
    if (typeof x === "number")
    {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    else
    {
        this.x = x.x;
        this.y = x.y;
        this.width = x.width;
        this.height = x.height;
    }
};

AABB.prototype = {
    getCenter: function ()
    {

        var wh = this.width / 2;
        var hh = this.height / 2;

        return new Vector(this.x + wh, this.y + hh);
    },
    scale:
        function(scale)
        {
            var center = this.getCenter();

            // scale size
            this.width *= scale;
            this.height *= scale;

            // starting point
            this.x = center.x - this.width / 2;
            this.y = center.y - this.height / 2;

            return this;
        },
    shrinkKeepingAspect: function(aabb, scale)
    {
        scale = scale || 1;

        if (aabb.height === 0)
        {
            throw new Error("Height can't be 0.");
        }

        var ratio = aabb.width / aabb.height;


        if (ratio < 1)
        {
            this.x *= scale;
            this.y = this.x * ratio;
        }
        else
        {
            this.y *= scale;
            this.x = this.y * ratio;
        }
    },
    extend: function(aabb)
    {
        if (aabb.x < this.x)
        {
            var delta = aabb.x - this.x;
            this.x += delta;
            this.width -= delta;

            return true;
        }
        if (aabb.y < this.y)
        {
            var delta = aabb.y - this.y;
            this.y += delta;
            this.height -= delta;

            return true;
        }
        if (aabb.x + aabb.width > this.x + this.width)
        {
            var delta = (aabb.x + aabb.width) - (this.x + this.width);
            this.width += delta;
            return true;
        }
        if (aabb.y + aabb.height > this.y + this.height)
        {
            var delta = (aabb.y + aabb.height) - (this.y + this.height);
            this.height += delta;
            return true;
        }

        return false;
    },

    contains: function(x,y)
    {
        return x > this.x && x < this.x + this.width &&
               y > this.y && y < this.y + this.height;
    },

    copy: function()
    {
        return new AABB(this);
    }
};

var bzv0 = new Vector();
var bzv1 = new Vector();

function bezierPoint(vector, x0,y0,x1,y1,t)
{
    var x = x0 + (x1 - x0) * t;
    var y = y0 + (y1 - y0) * t;

    vector.x = x;
    vector.y = y;

    return vector;
}
function bezierPointV(vector, v0,v1,t)
{
    var x0 = v0.x;
    var y0 = v0.y;
    var x = x0 + (v1.x - x0) * t;
    var y = y0 + (v1.y - y0) * t;

    vector.x = x;
    vector.y = y;

    return vector;
}

function quadraticBezier(x0,y0,x1,y1,x2,y2, current)
{
    var a = bezierPoint(bzv0, x0, y0, x1, y1, current);
    var b = bezierPoint(bzv1, x1, y1, x2, y2, current);

    return bezierPointV(new Vector(), a, b, current);
}

function collideCurveWithRect(x0,y0,x1,y1, x2, y2, w, h)
{
    var lo = 0.5;
    var hi = 1;

    var xLimit;
    var yLimit;

    var xSign;
    var ySign;

    var xMin = x2 - w/2;
    var xMax = x2 + w/2;
    var yMin = y2 - h/2;
    var yMax = y2 + h/2;


//            if (x0 > xMin &&
//                x0 < xMax &&
//                y0 > yMin &&
//                y0 < yMax)
//            {
//                return {
//                    t:0,
//                    pos: new Vector((x0+x2)/2,(y0+y2)/2)
//                };
//            }

    if (x1 > xMax)
    {
        xLimit = xMax;
        xSign = -1;
    }
    else
    {
        xLimit = xMin;
        xSign = 1;
    }
    if (y1 > yMax)
    {
        yLimit = yMax;
        ySign = -1;
    }
    else
    {
        yLimit = yMin;
        ySign = 1;
    }

    var pt,mid;
    do
    {
        mid = (lo + hi)/2;

        pt = quadraticBezier(x0,y0,x1,y1, x2,y2, mid);

        var dy = (yLimit - pt.y) * ySign;
        var dx = (xLimit - pt.x) * xSign;

        var delta = dx > dy ? dx : dy;

        if (delta == 0)
        {
            break;
        }
        else if (delta < 0)
        {
            hi = mid;
        }
        else
        {
            lo = mid;
        }


    } while (Math.abs(delta) > 2 && hi - lo > 0.01);

    return {pos: pt, t: mid};
}

function collideCurveWithCircle(x0,y0,x1,y1, cx, cy, r)
{
    var lo = 0.5;
    var hi = 1;
    var pt,mid;

    do
    {
        mid = (lo + hi)/2;

        pt = quadraticBezier(x0, y0, x1, y1, cx, cy, mid);
        var distance = pt.copy().subtract(cx,cy).len();

        if (distance === r)
        {
            break;
        }
        else if (distance < r)
        {
            hi = mid;
        }
        else
        {
            lo = mid;
        }

    } while (Math.abs(distance - r) > 3 && hi - lo > 0.01);

    return {pos: pt, t: mid};
}


function components(col)
{
    if (col[0] == "#")
    {
        col = col.substring(1);
    }

    if (col.length == 3)
    {
        return {
            r: parseInt(col[0], 16) * 17,
            g: parseInt(col[1], 16) * 17,
            b: parseInt(col[2], 16) * 17
        };
    }
    else if (col.length == 6)
    {
        return {
            r: parseInt(col.substring(0, 2), 16),
            g: parseInt(col.substring(2, 4), 16),
            b: parseInt(col.substring(4, 6), 16)
        };
    }
    else
    {
        throw new Error("Invalid color " + col);
    }
}

function hex(n)
{
    var s = n.toString(16);

    return s.length == 1 ? "0" + s : s;
}

function mix(col1, col2, ratio)
{
    var c1 = components(col1);
    var c2 = components(col2);

    var r = (c1.r + (c2.r - c1.r) * ratio) | 0;
    var g = (c1.g + (c2.g - c1.g) * ratio) | 0;
    var b = (c1.b + (c2.b - c1.b) * ratio) | 0;

    return rgb(r,g,b);
}

function rgb(r,g,b)
{
    return "#" + hex(r) + hex(g) + hex(b);
}

function fade(color, opacity)
{
    var col = components(color);
    return "rgba(" + col.r + ", " + col.g + ", " + col.b + ", " + opacity + ")";
}

module.exports = {
    mix: mix,
    fade:fade,
    rgb:rgb,
    quadraticBezier: quadraticBezier,
    collideCurveWithCircle: collideCurveWithCircle,
    collideCurveWithRect: collideCurveWithRect,
    AABB: AABB,
    Dimension: Dimension,
    Vector: Vector
};
