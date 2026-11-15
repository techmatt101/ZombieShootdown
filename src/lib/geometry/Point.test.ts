import { describe, expect, it } from 'vitest';
import { Point } from './Point';

describe('Point', () => {
    it('faces towards another point', () => {
        expect(new Point(0, 0, 0).rotateDirection({ x: 0, y: 5 }).direction).toBeCloseTo(Math.PI / 2);
        expect(new Point(1, 1, 0).rotateDirection({ x: -1, y: 1 }).direction).toBeCloseTo(Math.PI);
    });

    it('moves forwards along its facing direction', () => {
        const point = new Point(0, 0, Math.PI);
        point.trajectFromDirection(4);
        expect(point.x).toBeCloseTo(-4);
        expect(point.y).toBeCloseTo(0);
    });

    it('rotates around a pivot by its own direction', () => {
        const point = new Point(10, 0, Math.PI / 2).rotate({ x: 0, y: 0 });
        expect(point.x).toBeCloseTo(0);
        expect(point.y).toBeCloseTo(10);
    });

    it('copies direction with copy but keeps it with copyVector', () => {
        const point = new Point(0, 0, 1);
        point.copy(new Point(2, 3, 0.5));
        expect(point).toMatchObject({ x: 2, y: 3, direction: 0.5 });
        point.copyVector({ x: 7, y: 8 });
        expect(point).toMatchObject({ x: 7, y: 8, direction: 0.5 });
    });

    it('resets position and direction', () => {
        const point = new Point(5, 5, 2);
        point.reset();
        expect(point).toMatchObject({ x: 0, y: 0, direction: 0 });
    });
});
