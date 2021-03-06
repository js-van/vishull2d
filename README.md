vishull2d
=========
Computes the visible region from a point for a given environment represented by a collection of line segments.  [Based on Amit Patel's blog post](http://simblob.blogspot.com/2012/07/2d-visibility.html)

Try out the module yourself in your browser:

http://mikolalysenko.github.com/vishull2d/

Use
===
Just install it using npm:

    npm install vishull2d

Then you can use it in your game like this:

```javascript
var vishull = require("vishull2d")

//Line segments are encoded as pairs of arrays
var lines = [
  [[10, 10], [10, -10]]
]

//Compute visible hull from the point [0,0]
var region = vishull(lines, [0,0])
```

### `require("vishull2d")(segments, center)`
Computes the visible hull from the point `center`

* `segments` is a collection of line segments
* `center` is the point from which the visibility is computed

**Returns:**  A counter-clockwise oriented simple polygon representing the visible region.

**Note** This code assumes that all segments intersect only at their end points.  If you have any crossings, you will need to detect them and split them yourself.

Credits
=======
(c) 2013 Mikola Lysenko.  MIT License
