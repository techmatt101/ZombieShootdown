import type { Segment } from '../lib/geometry/Segment';

export interface Intersection {
    x : number;
    y : number;
    param : number;
}

// Find intersection of RAY & SEGMENT
export function getIntersection (ray : Segment, segment : Segment) : Intersection | null {

    // RAY in parametric: Point + Delta*T1
    const rpx = ray.a.x;
    const rpy = ray.a.y;
    const rdx = ray.b.x - ray.a.x;
    const rdy = ray.b.y - ray.a.y;

    // SEGMENT in parametric: Point + Delta*T2
    const spx = segment.a.x;
    const spy = segment.a.y;
    const sdx = segment.b.x - segment.a.x;
    const sdy = segment.b.y - segment.a.y;

    // Are they parallel? If so, no intersect
    const rmag = Math.hypot(rdx, rdy);
    const smag = Math.hypot(sdx, sdy);
    if (rdx / rmag === sdx / smag && rdy / rmag === sdy / smag) {
        // Unit vectors are the same.
        return null;
    }

    // SOLVE FOR T1 & T2
    const T2 = (rdx * (spy - rpy) + rdy * (rpx - spx)) / (sdx * rdy - sdy * rdx);
    const T1 = (spx + sdx * T2 - rpx) / rdx;

    // Must be within parametic whatevers for RAY/SEGMENT
    if (T1 < 0) return null;
    if (T2 < 0 || T2 > 1) return null;

    // Return the POINT OF INTERSECTION
    return {
        x: rpx + rdx * T1,
        y: rpy + rdy * T1,
        param: T1
    };
}