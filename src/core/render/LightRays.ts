class LightRays implements IUpdate {
    private _segments = [];
    private _lightSource = new Vector(0, 0);
    private _polygons = [];

    constructor (boundary : Box) {
        var segmentsWidth = boundary.width;
        var segmentsHeight = boundary.height;

        this._segments = [
            // Border
            {a: {x: 0, y: 0}, b: {x: segmentsWidth, y: 0}},
            {a: {x: segmentsWidth, y: 0}, b: {x: segmentsWidth, y: segmentsHeight}},
            {a: {x: segmentsWidth, y: segmentsHeight}, b: {x: 0, y: segmentsHeight}},
            {a: {x: 0, y: segmentsHeight}, b: {x: 0, y: 0}},
        ];
    }

    setLightSource (lightSource : Vector) {
        this._lightSource = lightSource;
    }

    loadBlocks (tiles : Entity[]) {
        for (var i = 0; i < tiles.length; i++) {
            if (tiles[i].id === 'WALL Tile' && tiles[i].pos.x !== 0 && tiles[i].pos.y !== 0 && tiles[i].pos.x !== 928 && tiles[i].pos.y !== 992) {
                this._segments = this._segments.concat(tiles[i].geometry.toPolygon());
                console.log("TILE");
            }
        }
    }

    update (dt : number) {
        //var fuzzyRadius = 10;
        //var numberOfRays = 4;
        //
        //this._polygons = [getSightPolygon(this._lightSource.x, this._lightSource.y, this._segments)];
        //
        //for (var angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / numberOfRays) {
        //    var dx = Math.cos(angle) * fuzzyRadius;
        //    var dy = Math.sin(angle) * fuzzyRadius;
        //    this._polygons.push(getSightPolygon(this._lightSource.x + dx, this._lightSource.y + dy, this._segments));
        //}

        this._polygons = [getSightPolygon(this._lightSource.x, this._lightSource.y, this._segments)];
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
    }

    draw (ctx) {
        //for (var i = 1; i < this._polygons.length; i++) {
        //    drawPolygon(this._polygons[i], ctx, "rgba(255,255,255,0.2)");
        //}

        drawPolygon(this._polygons[0], ctx, "#000");
    }
}

function drawPolygon (polygon, ctx, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    for (var i = 1; i < polygon.length; i++) {
        var intersect = polygon[i];
        ctx.lineTo(intersect.x, intersect.y);
    }
    ctx.fill();
}

// Find intersection of RAY & SEGMENT
function getIntersection (ray, segment) {

    // RAY in parametric: Point + Delta*T1
    var r_px = ray.a.x;
    var r_py = ray.a.y;
    var r_dx = ray.b.x - ray.a.x;
    var r_dy = ray.b.y - ray.a.y;

    // SEGMENT in parametric: Point + Delta*T2
    var s_px = segment.a.x;
    var s_py = segment.a.y;
    var s_dx = segment.b.x - segment.a.x;
    var s_dy = segment.b.y - segment.a.y;

    // Are they parallel? If so, no intersect
    var r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
    var s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
    if (r_dx / r_mag == s_dx / s_mag && r_dy / r_mag == s_dy / s_mag) {
        // Unit vectors are the same.
        return null;
    }

    // SOLVE FOR T1 & T2
    // r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
    // ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
    // ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
    // ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
    var T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
    var T1 = (s_px + s_dx * T2 - r_px) / r_dx;

    // Must be within parametic whatevers for RAY/SEGMENT
    if (T1 < 0) return null;
    if (T2 < 0 || T2 > 1) return null;

    // Return the POINT OF INTERSECTION
    return {
        x: r_px + r_dx * T1,
        y: r_py + r_dy * T1,
        param: T1
    };

}

function getSightPolygon (sightX, sightY, segments) {
    // Get all unique points
    var points = [];
    for (var i = 0; i < segments.length; i++) {
        points.push(segments[i].a, segments[i].b);
    }

    var uniquePoints = [];
    var set = {}, key = '';
    for (var i = 0; i < points.length; i++) {
        key = points[i].x + "," + points[i].y;
        if (typeof set[key] !== 'undefined') {
            continue;
        }
        set[key] = true;
        uniquePoints.push(points[i]);
    }

    // Get all angles
    var uniqueAngles = [];
    for (var j = 0; j < uniquePoints.length; j++) {
        var uniquePoint = uniquePoints[j];
        var angle : number = fastAtan2(uniquePoint.x - sightX, uniquePoint.y - sightY);
        uniquePoint.angle = angle;
        uniqueAngles.push(angle - 0.00001, angle, angle + 0.00001);
    }

    // RAYS IN ALL DIRECTIONS
    var intersects = [];
    for (var j = 0; j < uniqueAngles.length; j++) {
        var angle : number = uniqueAngles[j];

        // Calculate dx & dy from angle
        var dx = Math.cos(angle);
        var dy = Math.sin(angle);

        // Ray from center of screen to mouse
        var ray = {
            a: {x: sightX, y: sightY},
            b: {x: sightX + dx, y: sightY + dy}
        };

        // Find CLOSEST intersection
        var closestIntersect : any = null;
        for (var i = 0; i < segments.length; i++) {
            var intersect = getIntersection(ray, segments[i]);
            if (!intersect) continue;
            if (!closestIntersect || intersect.param < closestIntersect.param) {
                closestIntersect = intersect;
            }
        }

        // Intersect angle
        if (!closestIntersect) continue;
        closestIntersect.angle = angle;

        // Add to list of intersects
        intersects.push(closestIntersect);
    }

    // Sort intersects by angle
    intersects = intersects.sort(function (a, b) {
        return a.angle - b.angle;
    });

    // Polygon is intersects, in order of angle
    return intersects;
}

function isInPolygon (point, polygon) {

    // Ray just going right
    var ray = {
        a: {x: point.x, y: point.y},
        b: {x: point.x + 1, y: point.y}
    };

    // Get # of total intersection with polygon walls
    var numIntersections = 0;
    for (var i = 0; i < polygon.length; i++) {
        // Line from this point to the next
        var startPoint = polygon[i];
        var endPoint = (i == polygon.length - 1) ? polygon[0] : polygon[i + 1];
        var segment = {
            ax: startPoint.x, ay: startPoint.y,
            bx: endPoint.x, by: endPoint.y
        };
        if (getIntersection(ray, segment)) {
            numIntersections++;
        }
    }

    // If and only if it's odd, it's inside
    return (numIntersections % 2 == 1);

}