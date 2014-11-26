importScripts('helpers.js', 'raytracing.js');

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