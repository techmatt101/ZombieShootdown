import { describe, expect, it } from 'vitest';
import { Box } from './Box';
import { Vector } from './Vector';

describe('Box', () => {
    it('exposes its edges around its centre, following its position', () => {
        const box = new Box(10, 20, new Vector(5, 5));
        expect([box.left, box.right, box.top, box.bottom]).toEqual([0, 10, -5, 15]);
        box.pos.set(0, 0);
        expect([box.left, box.top]).toEqual([-5, -10]);
    });
});
