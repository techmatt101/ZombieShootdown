import { describe, expect, it } from 'vitest';
import { Vector } from './Vector';

describe('Vector', () => {
    it('adds, subtracts, multiplies and divides component-wise and chains', () => {
        const vector = new Vector(6, 8).add({ x: 2, y: 2 }).sub({ x: 4, y: 2 }).multiply({ x: 3, y: 2 }).divide({ x: 2, y: 4 });
        expect([vector.x, vector.y]).toEqual([6, 4]);
    });

    it('measures and normalises its length', () => {
        const vector = new Vector(3, 4);
        expect(vector.len()).toBe(5);
        vector.normalize();
        expect(vector.x).toBeCloseTo(0.6);
        expect(vector.y).toBeCloseTo(0.8);
    });

    it('leaves a zero vector untouched when normalising', () => {
        const vector = new Vector(0, 0).normalize();
        expect([vector.x, vector.y]).toEqual([0, 0]);
    });

    it('clamps, mins and maxes each axis independently', () => {
        expect(new Vector(-5, 50).clamp({ x: 0, y: 0 }, { x: 10, y: 10 })).toMatchObject({ x: 0, y: 10 });
        expect(new Vector(5, 1).min({ x: 3, y: 4 })).toMatchObject({ x: 3, y: 1 });
        expect(new Vector(5, 1).max({ x: 3, y: 4 })).toMatchObject({ x: 5, y: 4 });
    });

    it('moves along an angle with traject', () => {
        const vector = new Vector(0, 0);
        vector.traject(10, Math.PI / 2);
        expect(vector.x).toBeCloseTo(0);
        expect(vector.y).toBeCloseTo(10);
    });

    it('copies, compares, scales, reverses, offsets and floors', () => {
        const vector = Vector.From({ x: 1.7, y: -2.2 });
        expect(vector.equal({ x: 1.7, y: -2.2 })).toBe(true);
        vector.floor();
        expect(vector).toMatchObject({ x: 1, y: -3 });
        expect(vector.scale(2).reverse().offset({ x: 1, y: 1 })).toMatchObject({ x: -1, y: 7 });
        expect(new Vector(1, 2).dot({ x: 3, y: 4 })).toBe(11);
        vector.reset();
        expect(vector).toMatchObject({ x: 0, y: 0 });
    });
});
