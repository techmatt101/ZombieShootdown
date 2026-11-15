import { getIntersection, type Intersection } from './raytracing';
import type { IVector } from '../lib/geometry/IVector';
import type { Segment } from '../lib/geometry/Segment';

export interface LightRequest {
    x : number;
    y : number;
    s : Segment[];
}

type AngledIntersection = Intersection & { angle : number };

const CORNER_RAY_OFFSET = 0.00001;

self.addEventListener('message', (e : MessageEvent<LightRequest>) => {
    const polygons = [getSightPolygon(e.data.x, e.data.y, e.data.s)];
    self.postMessage(polygons);
});

function getSightPolygon(sightX : number, sightY : number, segments : Segment[]) : AngledIntersection[] {
    const rayAngles : number[] = [];
    for (const corner of uniqueEndPoints(segments)) {
        const angle = Math.atan2(corner.y - sightY, corner.x - sightX);
        rayAngles.push(angle - CORNER_RAY_OFFSET, angle, angle + CORNER_RAY_OFFSET);
    }

    const intersects : AngledIntersection[] = [];
    for (const angle of rayAngles) {
        const ray : Segment = {
            a: { x: sightX, y: sightY },
            b: { x: sightX + Math.cos(angle), y: sightY + Math.sin(angle) },
        };

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

    return intersects.sort((a, b) => a.angle - b.angle);
}

function uniqueEndPoints(segments : Segment[]) : Iterable<IVector> {
    const pointsByPosition = new Map<string, IVector>();
    for (const { a, b } of segments) {
        pointsByPosition.set(`${a.x},${a.y}`, a);
        pointsByPosition.set(`${b.x},${b.y}`, b);
    }
    return pointsByPosition.values();
}
