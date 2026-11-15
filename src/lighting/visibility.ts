import type { TileMap } from '../world/TileMap';

const CORNER_RAY_OFFSET = 0.00001;
const FILL_RAY_COUNT = 48;
const FULL_TURN = Math.PI * 2;
const LIT_SURFACE_DEPTH = 16;

export function computeVisibilityPolygon(tileMap : TileMap, originX : number, originY : number, radius : number) : Float32Array {
    const angles : number[] = [];
    tileMap.forEachCornerNear(originX, originY, radius, (cornerX, cornerY) => {
        const angle = Math.atan2(cornerY - originY, cornerX - originX);
        angles.push(angle - CORNER_RAY_OFFSET, angle, angle + CORNER_RAY_OFFSET);
    });
    for (let i = 0; i < FILL_RAY_COUNT; i++) {
        angles.push(-Math.PI + (i / FILL_RAY_COUNT) * FULL_TURN);
    }
    angles.sort((a, b) => a - b);

    const polygon = new Float32Array(angles.length * 2);
    for (let i = 0; i < angles.length; i++) {
        const directionX = Math.cos(angles[i]), directionY = Math.sin(angles[i]);
        const hitDistance = tileMap.raycast(originX, originY, directionX, directionY, radius);
        const distance = hitDistance < radius ? Math.min(hitDistance + LIT_SURFACE_DEPTH, radius) : radius;
        polygon[i * 2] = originX + directionX * distance;
        polygon[i * 2 + 1] = originY + directionY * distance;
    }
    return polygon;
}
