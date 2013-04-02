;(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
var vishull = require("../visibility")

var width = 500
var height = 500

var canvas = document.createElement("canvas")
canvas.width = width
canvas.height = height
document.body.appendChild(canvas)

var context = canvas.getContext("2d")

var lines = [
 [[10, 10], [400, 10]]
]

var dt = 0.1
var r = 100
var cx = width/2
var cy = height/2
for(var t=0.0; t+dt<2.0*Math.PI; t+=dt) {
  lines.push([
    [r*Math.cos(t)+cx, r*Math.sin(t)+cy],
    [r*Math.cos(t-dt/2)+cx, r*Math.sin(t-dt/2)+cy]
  ])
}

lines.push([[400,300], [300,400]])
lines.push([[400,300], [400,400]])
lines.push([[300,400], [400,400]])

function redraw(p) {
  context.fillStyle = "#234"
  context.fillRect(0, 0, width, height)
  
  var result = vishull(lines, p)
    , region = result.region
  
  context.fillStyle = "rgba(255, 255, 130, 0.5)"
  context.beginPath()
  context.moveTo(region[0][0], region[0][1])
  for(var i=1; i<region.length; ++i) {
    var r = region[i]
    context.lineTo(r[0], r[1])
  }
  context.lineTo(region[0][0], region[0][1])
  context.closePath()
  context.fill()
  
  
  for(var i=0; i<lines.length; ++i) {
    var s = lines[i]
    if(result.ids.indexOf(i) < 0) {
      context.strokeStyle = "#f00"
    } else {
      context.strokeStyle = "#0f0"
    }
    context.beginPath()
    context.moveTo(s[0][0], s[0][1])
    context.lineTo(s[1][0], s[1][1])
    context.closePath()
    context.stroke()
  }
  
  context.fillStyle = "rgba(255, 255, 0, 1)"
  context.beginPath()
  context.arc(p[0], p[1], 10, 0.0, 2.0*Math.PI)
  context.closePath()
  context.fill()
}

canvas.addEventListener("click", function(e) {
  redraw([e.x, e.y])
})

redraw([width/2, height/2])
},{"../visibility":2}],2:[function(require,module,exports){
"use strict"

var compareSlope = require("compare-slope")

var EPSILON = 1e-8
var MAX_F = 1.0 / EPSILON

function segIntersect(s, pt, dx, dy) {
  var s0 = s[0]
    , s1 = s[1]
    , nx = s1[0] - s0[0]
    , ny = s1[1] - s0[1]
    , ax = s0[0] - pt[0]
    , ay = s0[1] - pt[1]
    , nn = ay * nx - ax * ny
    , dd = dy * nx - dx * ny
  return [ dx * nn / dd, dy * nn / dd ]
}

function approxEq(x, y) {
  return Math.abs(x-y) <= EPSILON * Math.max(Math.abs(x), Math.abs(y))
}

function pointsEqual(a, b) {
  return approxEq(a[0], b[0]) && approxEq(a[1], b[1])
}

function createVisibleHull(segments, pt) {
  var points = []
    , os = segments.length
  
  //Copy segments and add a box around region
  segments = segments.slice(0)
  segments.push([[ MAX_F+pt[0], MAX_F+pt[1]], [-MAX_F+pt[0],  MAX_F+pt[1]]])
  segments.push([[-MAX_F+pt[0], MAX_F+pt[1]], [-MAX_F+pt[0], -MAX_F+pt[1]]])
  segments.push([[-MAX_F+pt[0],-MAX_F+pt[1]], [ MAX_F+pt[0], -MAX_F+pt[1]]])
  segments.push([[ MAX_F+pt[0],-MAX_F+pt[1]], [ MAX_F+pt[0],  MAX_F+pt[1]]])

  //Project points onto circle
  for(var i=0, ns=segments.length; i<ns; ++i) {
    var s = segments[i]
      , ax = s[0][0] - pt[0]
      , ay = s[0][1] - pt[1]
      , bx = s[1][0] - pt[0]
      , by = s[1][1] - pt[1]
    //Check degenerate cases
    if((approxEq(ax,0) && approxEq(ay,0)) ||
       (approxEq(bx,0) && approxEq(by,0)) ||
       (approxEq(ax,bx) && approxEq(ay,by)) ) {
      continue
    }
    var a = [ax, ay, i, false]
      , b = [bx, by, i, true]
    //Handle x-crossing degeneracy
    if(by < 0 && ay > 0) {
      var dy = by - ay
        , dx = bx - ax
        , x = ax - ay * dx / dy
      if(x > EPSILON) {
        var q = [x, 0, i, false]
        if(!pointsEqual(b, q)) {
          b[3] = false
          points.push(b)
        }
        if(!pointsEqual(a, q)) {
          a[3] = true
          points.push(q)
          points.push(a)
        }
        continue
      }
    }
    if(ay < 0 && by > 0) {
      var dy = ay - by
        , dx = ax - bx
        , x  = bx - by * dx / dy
      if(x > EPSILON) {
        var q = [x, 0, i, false]
        if(!pointsEqual(a, q)) {
          points.push(a)
        }
        if(!pointsEqual(b, q)) {
          points.push(q)
          points.push(b)
        }
        continue
      }
    }
    if(approxEq(by, 0) && bx > 0 && ay < 0) {
      points.push(a)
      continue
    }
    if(approxEq(ay, 0) && ax > 0 && by < 0) {
      b[3] = false
      points.push(b)
      continue
    }
    var sign = compareSlope(a, b)
    if(sign < 0) {
      points.push(a)
      points.push(b)
    } else if(sign > 0) {
      b[3] = false
      points.push(b)
      a[3] = true
      points.push(a)
    }
  }
  
  //Sort points by angle
  points.sort(compareSlope)
  points.push([1, 0, -1, true])
  
  //Assemble visible hull
  var vis_hull    = []
    , segment_ids = []
    , active      = []
    , result      = [0,0]
  for(var i=0, np=points.length; i<np; ++i) {
    var event = points[i]
    if(event[3]) {
      if(event[2] >= 0) {
        active.splice(active.indexOf(event[2]), 1)
      }
    } else {
      active.push(event[2])
    }
    if(i < np-1 && compareSlope(points[i], points[i+1]) === 0) {
      continue
    }
    var min_n = Infinity
      , min_d = 1
      , min_a = -1
      , d = points[i]
      , dx = d[0]
      , dy = d[1]
    for(var j=0, na=active.length; j<na; ++j) {
      var a = active[j]
        , s = segments[a]
        , s0 = s[0]
        , s1 = s[1]
        , nx = s1[0] - s0[0]
        , ny = s1[1] - s0[1]
        , ax = pt[0] - s0[0]
        , ay = pt[1] - s0[1]
        , nn = ay * nx - ax * ny
        , dd = dx * ny - dy * nx
      if(dd < 0) {
        nn = -nn
        dd = -dd
      }
      if(nn >= 0 && min_n * dd > min_d * nn) {
        min_n = nn
        min_d = dd
        min_a = a
      }
    }
    if(min_a < 0) {
      continue
    }
    var hull_n = vis_hull.length
    if(hull_n === 0) {
      vis_hull.push(segIntersect(segments[min_a], pt, dx, dy))
      segment_ids.push(min_a)
    } else {
      var pseg = segment_ids[hull_n-1]
      if(pseg !== min_a || event[2] < 0) {
        var i0 = segIntersect(segments[pseg], pt, dx, dy)
          , i1 = segIntersect(segments[min_a], pt, dx, dy)
        if(pointsEqual(i0, i1)) {
          vis_hull.push(i1)
          segment_ids.push(min_a)
        } else {
          vis_hull.push(i0)
          segment_ids.push(-1)
          vis_hull.push(i1)
          segment_ids.push(min_a)
        }
      }
    }
  }
  
  //Check if end points need to be joined
  var hull_n = segment_ids.length
  if(pointsEqual(vis_hull[hull_n-1], vis_hull[0])) {
    vis_hull.pop()
    segment_ids.pop()
    --hull_n
  }
  
  //Fix indices and segment ids
  for(var i=0; i<hull_n; ++i) {
    var sid = segment_ids[i]
    if(sid >= os) {
      segment_ids[i] = -1
    }
    vis_hull[i][0] += pt[0]
    vis_hull[i][1] += pt[1]
  }
  
  return {
    region: vis_hull,
    ids: segment_ids
  }
}

module.exports = createVisibleHull

},{"compare-slope":3}],3:[function(require,module,exports){
"use strict"

function quadrant(x, y) {
  if(x > 0) {
    if(y >= 0) {
      return 1
    } else {
      return 4
    }
  } else if(x < 0) {
    if(y >= 0) {
      return 2
    } else {
      return 3
    }
  } else if(y > 0) {
    return 1
  } else if(y < 0) {
    return 3
  }
  return 0
}

function compareSlope(a, b) {
  var ax = a[0]
    , ay = a[1]
    , bx = b[0]
    , by = b[1]
    , d = quadrant(ax, ay) - quadrant(bx, by)
  if(d) {
    return d
  }
  var p = ax * by
    , q = ay * bx
  if(p > q) { return -1 }
  if(p < q) { return  1 }
  return 0
}

module.exports = compareSlope
},{}]},{},[1])
;