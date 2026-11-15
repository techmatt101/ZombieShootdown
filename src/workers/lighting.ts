import { getIntersection, type Intersection } from './raytracing';
import type { IVector } from '../lib/geometry/IVector';
import type { Segment } from '../lib/geometry/Segment';

export interface LightRequest {
    x : number;
    y : number;
    s : Segment[];
}

type AngledIntersection = Intersection & { angle : number };

self.addEventListener('message', (e : MessageEvent<LightRequest>) => {
    const polygons = [getSightPolygon(e.data.x, e.data.y, e.data.s)];
    self.postMessage(polygons);
});

function getSightPolygon(sightX : number, sightY : number, segments : Segment[]) : AngledIntersection[] {
    // Get all unique segment end points
    const uniquePoints = new Map<string, IVector>();
    for (const { a, b } of segments) {
        for (const point of [a, b]) {
            uniquePoints.set(`${point.x},${point.y}`, point);
        }
    }

    // Cast three rays per point: at it and slightly either side, to see past corners
    const uniqueAngles : number[] = [];
    for (const point of uniquePoints.values()) {
        const angle = Math.atan2(point.y - sightY, point.x - sightX);
        uniqueAngles.push(angle - 0.00001, angle, angle + 0.00001);
    }

    const intersects : AngledIntersection[] = [];
    for (const angle of uniqueAngles) {
        const ray : Segment = {
            a: { x: sightX, y: sightY },
            b: { x: sightX + Math.cos(angle), y: sightY + Math.sin(angle) },
        };

        // Find the closest wall hit along this ray
        let closestIntersect : Intersection | null = null;
        for (const segment of segments) {
            const intersect = getIntersection(ray, segment);
            if (intersect && (!closestIntersect || intersect.param < closestIntersect.param)) {
                closestIntersect = intersect;
            }
        }

        if (closestIntersect) {
            intersects.push({ ...closestIntersect, angle });
        }
    }

    // Polygon is the intersects, in order of angle
    return intersects.sort((a, b) => a.angle - b.angle);
}
