import { describe, expect, it } from 'vitest';
import { fillPolygon } from './fillPolygon';

const SIZE = 10;

function seenPixels(mask : Uint8Array) {
    let seen = 0;
    for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 255) seen++;
    }
    return seen;
}

function rectangle(left : number, top : number, right : number, bottom : number) {
    return new Float32Array([left, top, right, top, right, bottom, left, bottom]);
}

describe('fillPolygon', () => {
    it('marks every pixel whose centre the polygon covers', () => {
        const mask = new Uint8Array(SIZE * SIZE);
        fillPolygon(mask, SIZE, rectangle(2, 2, 5, 5), 0, 0, 1);
        expect(seenPixels(mask)).toBe(9);
        expect(mask[2 + 2 * SIZE]).toBe(255);
        expect(mask[4 + 4 * SIZE]).toBe(255);
        expect(mask[5 + 5 * SIZE]).toBe(0);
    });

    it('follows sloped edges', () => {
        const mask = new Uint8Array(SIZE * SIZE);
        fillPolygon(mask, SIZE, new Float32Array([0, 0, 10, 0, 0, 10]), 0, 0, 1);
        expect(seenPixels(mask)).toBe(45);
        expect(mask[8]).toBe(255);
        expect(mask[9]).toBe(0);
    });

    it('clips the polygon to the mask', () => {
        const mask = new Uint8Array(SIZE * SIZE);
        fillPolygon(mask, SIZE, rectangle(-50, -50, 3, 3), 0, 0, 1);
        expect(seenPixels(mask)).toBe(9);
        fillPolygon(mask, SIZE, rectangle(-50, -50, 50, 50), 0, 0, 1);
        expect(seenPixels(mask)).toBe(SIZE * SIZE);
    });

    it('maps world space onto the mask through its origin and pixel size', () => {
        const mask = new Uint8Array(SIZE * SIZE);
        fillPolygon(mask, SIZE, rectangle(700, 350, 714, 364), 700, 300, 7);
        expect(seenPixels(mask)).toBe(4);
        expect(mask[0 + 7 * SIZE]).toBe(255);
        expect(mask[1 + 8 * SIZE]).toBe(255);
    });

    it('ignores polygons with fewer than three points', () => {
        const mask = new Uint8Array(SIZE * SIZE);
        fillPolygon(mask, SIZE, new Float32Array([0, 0, 10, 10]), 0, 0, 1);
        expect(seenPixels(mask)).toBe(0);
    });
});
