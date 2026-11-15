import { fastAtan2 } from './helpers';
import { getIntersection, type Intersection } from './raytracing';
import type { IVector } from '../lib/geometry/IVector';
import type { Segment } from '../lib/geometry/Segment';

export interface LightRequest {
    x : number;
    y : number;
    s : Segment[];
}

type AngledIntersection = Intersection & { angle : number };

self.addEventListener('message', function (e : MessageEvent<LightRequest>) {

    //var fuzzyRadius = 10;
    //var numberOfRays = 6;

    var polygons = [getSightPolygon(e.data.x, e.data.y, e.data.s)];

    //for (var angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / numberOfRays) {
    //    var dx = Math.cos(angle) * fuzzyRadius;
    //    var dy = Math.sin(angle) * fuzzyRadius;
    //    polygons.push(getSightPolygon(e.data.x + dx, e.data.y + dy, e.data.s));
    //}

    self.postMessage(polygons);
});

function getSightPolygon (sightX : number, sightY : number, segments : Segment[]) : AngledIntersection[] {
    // Get all unique points
    var points : IVector[] = [];
    for (var i = 0; i < segments.length; i++) {
        points.push(segments[i].a, segments[i].b);
    }

    var uniquePoints : IVector[] = [];
    var set : Record<string, boolean> = {}, key = '';
    for (var i = 0; i < points.length; i++) {
        key = points[i].x + "," + points[i].y;
        if (typeof set[key] !== 'undefined') {
            continue;
        }
        set[key] = true;
        uniquePoints.push(points[i]);
    }

    // Get all angles
    var uniqueAngles : number[] = [];
    for (var j = 0; j < uniquePoints.length; j++) {
        var uniquePoint = uniquePoints[j];
        var angle = fastAtan2(uniquePoint.x - sightX, uniquePoint.y - sightY);
        uniqueAngles.push(angle - 0.00001, angle, angle + 0.00001);
    }

    // RAYS IN ALL DIRECTIONS
    var intersects : AngledIntersection[] = [];
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
        var closestIntersect : Intersection | null = null;
        for (var i = 0; i < segments.length; i++) {
            var intersect = getIntersection(ray, segments[i]);
            if (!intersect) continue;
            if (!closestIntersect || intersect.param < closestIntersect.param) {
                closestIntersect = intersect;
            }
        }

        // Intersect angle
        if (!closestIntersect) continue;

        // Add to list of intersects
        intersects.push({ ...closestIntersect, angle: angle });
    }

    // Sort intersects by angle
    intersects = intersects.sort(function (a, b) {
        return a.angle - b.angle;
    });

    // Polygon is intersects, in order of angle
    return intersects;
}