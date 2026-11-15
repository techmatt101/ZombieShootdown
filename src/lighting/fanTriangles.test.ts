import { describe, expect, it } from 'vitest';
import { fanTriangles, fanVertexCount } from './fanTriangles';

describe('fanTriangles', () => {
    const square = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);

    it('needs one triangle from the origin to every edge of the polygon', () => {
        expect(fanVertexCount(square)).toBe(12);
    });

    it('fans out from the origin, closing the last edge back to the first point', () => {
        const out = new Float32Array(30);
        const end = fanTriangles(0, 0, square, out, 2);
        expect(end).toBe(26);
        expect([...out.subarray(2, end)]).toEqual([
            0, 0, -1, -1, 1, -1,
            0, 0, 1, -1, 1, 1,
            0, 0, 1, 1, -1, 1,
            0, 0, -1, 1, -1, -1,
        ]);
    });
});
