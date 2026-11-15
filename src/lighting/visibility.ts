import { TILE_SIZE } from '../world/constants';
import type { TileMap } from '../world/TileMap';

const CORNER_RAY_OFFSET = 0.00001;
const SAME_ANGLE = 1e-9;
const RIM_RAY_COUNT = 24;
const FULL_TURN = Math.PI * 2;
const LIT_SURFACE_DEPTH = 16;
const INITIAL_RAY_CAPACITY = 256;

let angles = new Float64Array(INITIAL_RAY_CAPACITY);
let angleCount = 0;
let castingMap : TileMap;
let castingFromX = 0;
let castingFromY = 0;

export function computeVisibilityPolygon(tileMap : TileMap, originX : number, originY : number, radius : number) : Float32Array {
    castingMap = tileMap;
    castingFromX = originX;
    castingFromY = originY;
    angleCount = 0;
    tileMap.forEachCornerNear(originX, originY, radius, aimAtCorner);
    for (let i = 0; i < RIM_RAY_COUNT; i++) {
        addAngle(-Math.PI + (i / RIM_RAY_COUNT) * FULL_TURN);
    }
    const sorted = angles.subarray(0, angleCount).sort();
    const rayCount = countDistinct(sorted);

    const polygon = new Float32Array(rayCount * 2);
    let point = 0;
    let previous = -Infinity;
    for (let i = 0; i < sorted.length; i++) {
        const angle = sorted[i];
        if (angle - previous <= SAME_ANGLE) continue;
        previous = angle;
        const directionX = Math.cos(angle), directionY = Math.sin(angle);
        const hitDistance = tileMap.raycast(originX, originY, directionX, directionY, radius);
        const distance = hitDistance < radius ? Math.min(hitDistance + LIT_SURFACE_DEPTH, radius) : radius;
        polygon[point++] = originX + directionX * distance;
        polygon[point++] = originY + directionY * distance;
    }
    return polygon;
}

function aimAtCorner(cornerX : number, cornerY : number) {
    const towardsX = cornerX - castingFromX, towardsY = cornerY - castingFromY;
    const sight = cornerSight(castingMap, cornerX, cornerY, towardsX, towardsY);
    if (sight === CornerSight.HIDDEN) return;
    const angle = Math.atan2(towardsY, towardsX);
    if (sight === CornerSight.GRAZED) {
        addAngle(angle - CORNER_RAY_OFFSET);
        addAngle(angle + CORNER_RAY_OFFSET);
    } else {
        addAngle(angle);
    }
}

export enum CornerSight {
    HIDDEN,
    FACED,
    GRAZED,
}

export function cornerSight(tileMap : TileMap, cornerX : number, cornerY : number, towardsX : number, towardsY : number) : CornerSight {
    if (towardsX === 0 || towardsY === 0) return CornerSight.GRAZED;
    const vertexX = Math.round(cornerX / TILE_SIZE), vertexY = Math.round(cornerY / TILE_SIZE);
    const behindX = towardsX > 0 ? vertexX - 1 : vertexX;
    const behindY = towardsY > 0 ? vertexY - 1 : vertexY;
    const aheadX = towardsX > 0 ? vertexX : vertexX - 1;
    const aheadY = towardsY > 0 ? vertexY : vertexY - 1;
    if (tileMap.isSolidTile(behindX, behindY)) return CornerSight.HIDDEN;
    const isOneSideOpen = tileMap.isSolidTile(aheadX, behindY) !== tileMap.isSolidTile(behindX, aheadY);
    return isOneSideOpen ? CornerSight.GRAZED : CornerSight.FACED;
}

function addAngle(angle : number) {
    if (angleCount === angles.length) {
        const grown = new Float64Array(angles.length * 2);
        grown.set(angles);
        angles = grown;
    }
    angles[angleCount++] = angle;
}

function countDistinct(sorted : Float64Array) {
    let count = 0;
    let previous = -Infinity;
    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] - previous > SAME_ANGLE) {
            count++;
            previous = sorted[i];
        }
    }
    return count;
}
