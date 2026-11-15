import { TILE_SIZE } from '../world/constants';
import type { TileMap } from '../world/TileMap';

const CORNER_RAY_OFFSET = 0.00001;
const SAME_ANGLE = 1e-9;
const RIM_RAY_COUNT = 24;
const FULL_TURN = Math.PI * 2;
const LIT_SURFACE_DEPTH = 16;
const INITIAL_RAY_CAPACITY = 256;
const MIN_ARC_RIM_RAYS = 2;
const FULL_CIRCLE_HALF_ANGLE = Math.PI;

export interface LightArc {
    direction : number;
    halfAngle : number;
}

let angles = new Float64Array(INITIAL_RAY_CAPACITY);
let angleCount = 0;
let castingMap : TileMap;
let castingFromX = 0;
let castingFromY = 0;
let arcDirection = 0;
let arcHalfAngle = FULL_CIRCLE_HALF_ANGLE;

export function computeVisibilityPolygon(tileMap : TileMap, originX : number, originY : number, radius : number, arc : LightArc | null = null) : Float32Array {
    castingMap = tileMap;
    castingFromX = originX;
    castingFromY = originY;
    arcDirection = arc?.direction ?? 0;
    arcHalfAngle = Math.min(arc?.halfAngle ?? FULL_CIRCLE_HALF_ANGLE, FULL_CIRCLE_HALF_ANGLE);
    const isCone = arcHalfAngle < FULL_CIRCLE_HALF_ANGLE;
    angleCount = 0;
    tileMap.forEachCornerNear(originX, originY, radius, aimAtCorner);
    if (isCone) {
        addArcRim();
    } else {
        for (let i = 0; i < RIM_RAY_COUNT; i++) {
            addAngle(-Math.PI + (i / RIM_RAY_COUNT) * FULL_TURN);
        }
    }
    const sorted = angles.subarray(0, angleCount).sort();
    const rayCount = countDistinct(sorted);
    const originPoints = isCone ? 1 : 0;

    const polygon = new Float32Array((rayCount + originPoints) * 2);
    let point = 0;
    if (isCone) {
        polygon[point++] = originX;
        polygon[point++] = originY;
    }
    let previous = -Infinity;
    for (let i = 0; i < sorted.length; i++) {
        const turn = sorted[i];
        if (turn - previous <= SAME_ANGLE) continue;
        previous = turn;
        const angle = arcDirection + turn;
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

function addArcRim() {
    const rimRays = Math.max(MIN_ARC_RIM_RAYS, Math.ceil(RIM_RAY_COUNT * (2 * arcHalfAngle) / FULL_TURN) + 1);
    for (let i = 0; i < rimRays; i++) {
        addAngle(arcDirection - arcHalfAngle + (i / (rimRays - 1)) * 2 * arcHalfAngle);
    }
}

function turnFromArcCentre(angle : number) {
    const turn = angle - arcDirection;
    return turn - FULL_TURN * Math.floor((turn + Math.PI) / FULL_TURN);
}

function addAngle(angle : number) {
    const turn = turnFromArcCentre(angle);
    if (Math.abs(turn) > arcHalfAngle + SAME_ANGLE) return;
    if (angleCount === angles.length) {
        const grown = new Float64Array(angles.length * 2);
        grown.set(angles);
        angles = grown;
    }
    angles[angleCount++] = turn;
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
