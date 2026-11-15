import { getIntersection } from './raytracing';
import type { IVector } from '../lib/geometry/IVector';
import type { Segment } from '../lib/geometry/Segment';

export interface LineOfSightRequest {
    id : number;
    p1 : IVector;
    p2 : IVector;
    segments : Segment[];
}

export interface LineOfSightResponse {
    id : number;
    value : boolean;
}

/** Answers whether p1 has an unobstructed line of sight to p2. */
self.addEventListener('message', (e : MessageEvent<LineOfSightRequest>) => {
    const { id, p1, p2, segments } = e.data;

    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const ray : Segment = {
        a: { x: p1.x, y: p1.y },
        b: { x: p1.x + Math.cos(angle), y: p1.y + Math.sin(angle) },
    };
    const length = Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const blocked = segments.some((segment) => {
        const intersect = getIntersection(ray, segment);
        return intersect !== null && intersect.param < length;
    });

    const response : LineOfSightResponse = { id, value: !blocked };
    self.postMessage(response);
});
