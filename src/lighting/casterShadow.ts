import type { IVector } from '../lib/geometry/IVector';

export interface ShadowOccluder {
    readonly pos : IVector;
    readonly radius : number;
}

export const SHADOW_ARC_SEGMENTS = 4;
const VERTICES_PER_SEGMENT = 6;
const FLOATS_PER_VERTEX = 2;
export const FLOATS_PER_CASTER_SHADOW = SHADOW_ARC_SEGMENTS * VERTICES_PER_SEGMENT * FLOATS_PER_VERTEX;
const LONGEST_SHADOW_IN_LIGHT_RADII = 4;

export function casterShadow(lightX : number, lightY : number, lightRadius : number, caster : ShadowOccluder, out : Float32Array, offset : number) {
    const { x, y } = caster.pos, radius = caster.radius;
    const towardsX = x - lightX, towardsY = y - lightY;
    const distance = Math.hypot(towardsX, towardsY);
    if (distance <= radius || distance - radius >= lightRadius) return offset;

    const awayFromLight = Math.atan2(towardsY, towardsX);
    const tangentAngle = Math.asin(radius / distance);
    const arcHalfSpan = Math.PI / 2 + tangentAngle;
    const reach = Math.min(lightRadius / Math.cos(tangentAngle), lightRadius * LONGEST_SHADOW_IN_LIGHT_RADII);

    let written = offset;
    let nearX = 0, nearY = 0, farX = 0, farY = 0;
    for (let i = 0; i <= SHADOW_ARC_SEGMENTS; i++) {
        const angle = awayFromLight - arcHalfSpan + (2 * arcHalfSpan * i) / SHADOW_ARC_SEGMENTS;
        const edgeX = x + Math.cos(angle) * radius, edgeY = y + Math.sin(angle) * radius;
        const rayX = edgeX - lightX, rayY = edgeY - lightY;
        const rayScale = reach / Math.hypot(rayX, rayY);
        const castX = lightX + rayX * rayScale, castY = lightY + rayY * rayScale;
        if (i > 0) {
            written = writeQuad(out, written, nearX, nearY, edgeX, edgeY, castX, castY, farX, farY);
        }
        nearX = edgeX;
        nearY = edgeY;
        farX = castX;
        farY = castY;
    }
    return written;
}

function writeQuad(out : Float32Array, offset : number, ax : number, ay : number, bx : number, by : number, cx : number, cy : number, dx : number, dy : number) {
    out[offset] = ax;
    out[offset + 1] = ay;
    out[offset + 2] = bx;
    out[offset + 3] = by;
    out[offset + 4] = cx;
    out[offset + 5] = cy;
    out[offset + 6] = ax;
    out[offset + 7] = ay;
    out[offset + 8] = cx;
    out[offset + 9] = cy;
    out[offset + 10] = dx;
    out[offset + 11] = dy;
    return offset + VERTICES_PER_SEGMENT * FLOATS_PER_VERTEX;
}
