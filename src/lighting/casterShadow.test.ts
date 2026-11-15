import { describe, expect, it } from 'vitest';
import { casterShadow, FLOATS_PER_CASTER_SHADOW, type ShadowOccluder } from './casterShadow';

const LIGHT_RADIUS = 500;

function caster(x : number, y : number, radius = 20) : ShadowOccluder {
    return { pos: { x, y }, radius };
}

function shadowFrom(lightX : number, lightY : number, occluder : ShadowOccluder) {
    const out = new Float32Array(FLOATS_PER_CASTER_SHADOW + 4).fill(-1);
    const end = casterShadow(lightX, lightY, LIGHT_RADIUS, occluder, out, 2);
    return { out, end, triangles: out.subarray(2, end) };
}

function cross(ax : number, ay : number, bx : number, by : number, px : number, py : number) {
    return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

function isShadowed(triangles : Float32Array, x : number, y : number) {
    for (let i = 0; i < triangles.length; i += 6) {
        const ab = cross(triangles[i], triangles[i + 1], triangles[i + 2], triangles[i + 3], x, y);
        const bc = cross(triangles[i + 2], triangles[i + 3], triangles[i + 4], triangles[i + 5], x, y);
        const ca = cross(triangles[i + 4], triangles[i + 5], triangles[i], triangles[i + 1], x, y);
        const hasNegative = ab < 0 || bc < 0 || ca < 0, hasPositive = ab > 0 || bc > 0 || ca > 0;
        if (!(hasNegative && hasPositive)) return true;
    }
    return false;
}

describe('casterShadow', () => {
    it('writes a fixed run of triangles after the given offset, leaving the rest alone', () => {
        const { out, end } = shadowFrom(0, 0, caster(100, 0));
        expect(end).toBe(2 + FLOATS_PER_CASTER_SHADOW);
        expect(out[0]).toBe(-1);
        expect(out[end]).toBe(-1);
    });

    it('darkens the floor straight behind the body, out to the edge of the light', () => {
        const { triangles } = shadowFrom(0, 0, caster(100, 0));
        expect(isShadowed(triangles, 140, 0)).toBe(true);
        expect(isShadowed(triangles, 300, 10)).toBe(true);
        expect(isShadowed(triangles, LIGHT_RADIUS - 1, 0)).toBe(true);
    });

    it('widens with distance between the tangent lines, and stays out of them', () => {
        const { triangles } = shadowFrom(0, 0, caster(100, 0));
        expect(isShadowed(triangles, 400, 70)).toBe(true);
        expect(isShadowed(triangles, 400, 95)).toBe(false);
        expect(isShadowed(triangles, 140, 30)).toBe(false);
    });

    it('never covers the body itself, so the caster stays lit', () => {
        const { triangles } = shadowFrom(0, 0, caster(100, 0));
        expect(isShadowed(triangles, 100, 0)).toBe(false);
        expect(isShadowed(triangles, 115, 0)).toBe(false);
        expect(isShadowed(triangles, 100, 15)).toBe(false);
    });

    it('casts nothing towards the light', () => {
        const { triangles } = shadowFrom(0, 0, caster(100, 0));
        expect(isShadowed(triangles, 50, 0)).toBe(false);
        expect(isShadowed(triangles, -100, 0)).toBe(false);
    });

    it('points away from the light whichever side it is on', () => {
        const { triangles } = shadowFrom(200, 300, caster(200, 200));
        expect(isShadowed(triangles, 200, 100)).toBe(true);
        expect(isShadowed(triangles, 200, 250)).toBe(false);
    });

    it('casts nothing for a light inside the body, like the player\'s own torch', () => {
        const { end } = shadowFrom(100, 0, caster(100, 0));
        expect(end).toBe(2);
        expect(shadowFrom(110, 5, caster(100, 0)).end).toBe(2);
    });

    it('casts nothing for a body beyond the light\'s reach', () => {
        expect(shadowFrom(0, 0, caster(LIGHT_RADIUS + 30, 0)).end).toBe(2);
    });

    it('keeps shadows from a light hugging the body to a bounded length', () => {
        const { triangles } = shadowFrom(0, 0, caster(20.5, 0));
        for (let i = 0; i < triangles.length; i += 2) {
            expect(Math.hypot(triangles[i], triangles[i + 1])).toBeLessThanOrEqual(LIGHT_RADIUS * 4 + 1);
        }
    });
});
