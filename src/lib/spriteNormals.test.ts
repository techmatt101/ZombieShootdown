import { describe, expect, it } from 'vitest';
import { normalsFromPixels } from './spriteNormals';

const FLAT = [128, 128, 255, 255];

function square(size : number, inset : number, colour = [255, 255, 255]) {
    const pixels = new Uint8ClampedArray(size * size * 4);
    for (let y = inset; y < size - inset; y++) {
        for (let x = inset; x < size - inset; x++) {
            pixels.set([...colour, 255], (x + y * size) * 4);
        }
    }
    return pixels;
}

function normalAt(normals : Uint8ClampedArray, size : number, x : number, y : number) {
    return [...normals.subarray((x + y * size) * 4, (x + y * size) * 4 + 4)];
}

describe('normalsFromPixels', () => {
    const size = 11;
    const normals = normalsFromPixels(square(size, 2), size, size);

    it('faces straight out of the screen in the middle of a solid shape', () => {
        expect(normalAt(normals, size, 5, 5)).toEqual(FLAT);
    });

    it('faces straight out where there is nothing to light', () => {
        expect(normalAt(normals, size, 0, 0)).toEqual(FLAT);
    });

    it('bevels the edges of a shape so they lean outwards, green pointing up like common normal map tools', () => {
        const [leftX] = normalAt(normals, size, 2, 5);
        const [rightX] = normalAt(normals, size, 8, 5);
        const [, topY] = normalAt(normals, size, 5, 2);
        const [, bottomY] = normalAt(normals, size, 5, 8);
        expect(leftX).toBeLessThan(128);
        expect(rightX).toBeGreaterThan(128);
        expect(topY).toBeGreaterThan(128);
        expect(bottomY).toBeLessThan(128);
    });

    it('raises brighter pixels, so detail catches the light', () => {
        const pixels = square(size, 0, [0, 0, 0]);
        pixels.set([255, 255, 255, 255], (5 + 5 * size) * 4);
        const detailed = normalsFromPixels(pixels, size, size);
        const [leftOfBright] = normalAt(detailed, size, 4, 5);
        const [rightOfBright] = normalAt(detailed, size, 6, 5);
        expect(leftOfBright).toBeLessThan(128);
        expect(rightOfBright).toBeGreaterThan(128);
    });

    it('always returns unit length normals', () => {
        for (let i = 0; i < normals.length; i += 4) {
            const [x, y, z] = [normals[i], normals[i + 1], normals[i + 2]].map((channel) => channel / 255 * 2 - 1);
            expect(Math.hypot(x, y, z)).toBeCloseTo(1, 1);
        }
    });
});
