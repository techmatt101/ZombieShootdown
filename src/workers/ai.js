importScripts('helpers.js', 'raytracing.js');

onmessage = function (e) {

    var p1 = e.data.p1,
        p2 = e.data.p2;

    // RAYS IN ALL DIRECTIONS
    var angle = fastAtan2(p2.x - p1.x, p2.y - p1.y);

    // Calculate dx & dy from angle
    var dx = Math.cos(angle),
        dy = Math.sin(angle);

    // Ray from center of screen to mouse
    var ray = {
        a: {x: p1.x, y: p1.y},
        b: {x: p1.x + dx, y: p1.y + dy}
    };

    var length = findDistance(p1.x, p1.y, p2.x, p2.y);

    // Find CLOSEST intersection
    var intersect = null;
    for (var i = 0; i < e.data.segments.length; i++) {
        intersect = getIntersection(ray, e.data.segments[i]);
        if (intersect !== null && intersect.param < length) {
            postMessage({id: e.data.id, value: false});
            return;
        }
    }

    postMessage({id: e.data.id, value: true});
};