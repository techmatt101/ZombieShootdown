onmessage = function (e) {

    //var fuzzyRadius = 10;
    //var numberOfRays = 6;

    var polygons = [getSightPolygon(e.data.x, e.data.y, e.data.s)];

    //for (var angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / numberOfRays) {
    //    var dx = Math.cos(angle) * fuzzyRadius;
    //    var dy = Math.sin(angle) * fuzzyRadius;
    //    polygons.push(getSightPolygon(e.data.x + dx, e.data.y + dy, e.data.s));
    //}

    postMessage(polygons);
};


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
        var angle = fastAtan2(uniquePoint.x - sightX, uniquePoint.y - sightY);
        uniquePoint.angle = angle;
        uniqueAngles.push(angle - 0.00001, angle, angle + 0.00001);
    }

    // RAYS IN ALL DIRECTIONS
    var intersects = [];
    for (var j = 0; j < uniqueAngles.length; j++) {
        var angle = uniqueAngles[j];

        // Calculate dx & dy from angle
        var dx = Math.cos(angle);
        var dy = Math.sin(angle);

        // Ray from center of screen to mouse
        var ray = {
            a: {x: sightX, y: sightY},
            b: {x: sightX + dx, y: sightY + dy}
        };

        // Find CLOSEST intersection
        var closestIntersect = null;
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

function fastAtan2(x, y) {
    if (x == 0 && y == 0) {
        return 0.00;
    }
    var radian = Math.acos(x / Math.sqrt(x * x + y * y));
    if (y < 0) {
        radian = -radian;
    }
    return radian;
}