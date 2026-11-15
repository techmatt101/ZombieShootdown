import { describe, expect, it } from 'vitest';
import { Box } from './Box';
import { Vector } from './Vector';

describe('Box', () => {
    it('overlaps boxes that intersect but not ones that only touch edges', () => {
        const box = new Box(10, 10, new Vector(0, 0));
        expect(box.isBoundingBoxWith(new Box(10, 10, new Vector(9, 9)))).toBe(true);
        expect(box.isBoundingBoxWith(new Box(10, 10, new Vector(10, 0)))).toBe(false);
        expect(box.isBoundingBoxWith(new Box(10, 10, new Vector(0, 11)))).toBe(false);
    });

    it('pushes out along the shallowest axis, away from the other box', () => {
        const box = new Box(10, 10, new Vector(8, 1));
        const offset = box.getOffset(new Box(10, 10, new Vector(0, 0)));
        expect([offset.x, offset.y]).toEqual([2, 0]);

        const below = new Box(10, 10, new Vector(1, -7));
        const upwardsOffset = below.getOffset(new Box(10, 10, new Vector(0, 0)));
        expect([upwardsOffset.x, upwardsOffset.y]).toEqual([0, -3]);
    });

    it('measures distance from a point to its edges, zero inside', () => {
        const box = new Box(10, 20, new Vector(0, 0));
        expect(box.distanceTo({ x: 2, y: 3 })).toBe(0);
        expect(box.distanceTo({ x: 8, y: 0 })).toBe(3);
        expect(box.distanceTo({ x: 8, y: 14 })).toBe(5);
    });
});
