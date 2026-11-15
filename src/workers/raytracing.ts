import type { Segment } from '../lib/geometry/Segment';

export interface Intersection {
    x : number;
    y : number;
    param : number;
}

export function getIntersection(ray : Segment, segment : Segment) : Intersection | null {
    const rayOriginX = ray.a.x;
    const rayOriginY = ray.a.y;
    const rayDeltaX = ray.b.x - ray.a.x;
    const rayDeltaY = ray.b.y - ray.a.y;

    const segmentOriginX = segment.a.x;
    const segmentOriginY = segment.a.y;
    const segmentDeltaX = segment.b.x - segment.a.x;
    const segmentDeltaY = segment.b.y - segment.a.y;

    const rayLength = Math.hypot(rayDeltaX, rayDeltaY);
    const segmentLength = Math.hypot(segmentDeltaX, segmentDeltaY);
    const isParallel = rayDeltaX / rayLength === segmentDeltaX / segmentLength
        && rayDeltaY / rayLength === segmentDeltaY / segmentLength;
    if (isParallel) {
        return null;
    }

    const positionAlongSegment = (rayDeltaX * (segmentOriginY - rayOriginY) + rayDeltaY * (rayOriginX - segmentOriginX))
        / (segmentDeltaX * rayDeltaY - segmentDeltaY * rayDeltaX);
    const distanceAlongRay = (segmentOriginX + segmentDeltaX * positionAlongSegment - rayOriginX) / rayDeltaX;

    const isBehindRay = distanceAlongRay < 0;
    const isOffSegment = positionAlongSegment < 0 || positionAlongSegment > 1;
    if (isBehindRay || isOffSegment) {
        return null;
    }

    return {
        x: rayOriginX + rayDeltaX * distanceAlongRay,
        y: rayOriginY + rayDeltaY * distanceAlongRay,
        param: distanceAlongRay,
    };
}
