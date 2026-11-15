import { describe, expect, it } from 'vitest';
import { Box } from './Box';
import { Circle } from './Circle';
import { boxesOverlap, distanceToBox, NO_HIT, segmentBoxEntry, segmentCircleEntry, separateBoxes, separateCircleFromBox, separateCircles } from './overlap';
import { Vector } from './Vector';

const boxAt = (x : number, y : number, width = 42, height = 42) => new Box(width, height, new Vector(x, y));
const circleAt = (x : number, y : number, radius : number) => new Circle(radius, new Vector(x, y));
const point = (x : number, y : number) => ({ x, y });

describe('boxesOverlap', () => {
    it('overlaps boxes that intersect but not ones that only touch edges', () => {
        const box = boxAt(0, 0, 10, 10);
        expect(boxesOverlap(box, boxAt(9, 9, 10, 10))).toBe(true);
        expect(boxesOverlap(box, boxAt(10, 0, 10, 10))).toBe(false);
        expect(boxesOverlap(box, boxAt(0, 11, 10, 10))).toBe(false);
    });
});

describe('separateBoxes', () => {
    it('pushes out along the shallowest axis, away from the other box', () => {
        const push = new Vector(0, 0);
        expect(separateBoxes(boxAt(8, 1, 10, 10), boxAt(0, 0, 10, 10), push)).toBe(true);
        expect([push.x, push.y]).toEqual([2, 0]);
        expect(separateBoxes(boxAt(1, -7, 10, 10), boxAt(0, 0, 10, 10), push)).toBe(true);
        expect([push.x, push.y]).toEqual([0, -3]);
    });

    it('leaves boxes that do not overlap alone', () => {
        expect(separateBoxes(boxAt(20, 0, 10, 10), boxAt(0, 0, 10, 10), new Vector(0, 0))).toBe(false);
    });
});

describe('separateCircles', () => {
    it('pushes the first circle straight away from the second by the overlap', () => {
        const push = new Vector(0, 0);
        expect(separateCircles(circleAt(30, 40, 30), circleAt(0, 0, 30), push)).toBe(true);
        expect(push.x).toBeCloseTo(6);
        expect(push.y).toBeCloseTo(8);
    });

    it('leaves circles that only touch alone', () => {
        expect(separateCircles(circleAt(60, 0, 30), circleAt(0, 0, 30), new Vector(0, 0))).toBe(false);
    });

    it('still separates circles stacked exactly on top of each other', () => {
        const push = new Vector(0, 0);
        expect(separateCircles(circleAt(5, 5, 10), circleAt(5, 5, 10), push)).toBe(true);
        expect(push.len()).toBeCloseTo(20);
    });
});

describe('separateCircleFromBox', () => {
    it('pushes straight out of a flat face', () => {
        const push = new Vector(0, 0);
        expect(separateCircleFromBox(circleAt(30, 5, 20), boxAt(0, 0), push)).toBe(true);
        expect(push.x).toBeCloseTo(11);
        expect(push.y).toBeCloseTo(0);
    });

    it('pushes diagonally off a corner, so bodies slide round it', () => {
        const push = new Vector(0, 0);
        expect(separateCircleFromBox(circleAt(30, 30, 20), boxAt(0, 0), push)).toBe(true);
        expect(push.x).toBeGreaterThan(0);
        expect(push.x).toBeCloseTo(push.y);
        expect(Math.hypot(30 + push.x - 21, 30 + push.y - 21)).toBeCloseTo(20);
    });

    it('pushes a circle whose centre is inside the box out through the nearest face', () => {
        const push = new Vector(0, 0);
        expect(separateCircleFromBox(circleAt(18, 0, 10), boxAt(0, 0), push)).toBe(true);
        expect(push.x).toBeCloseTo(13);
        expect(push.y).toBe(0);
    });

    it('ignores circles clear of the box', () => {
        expect(separateCircleFromBox(circleAt(50, 50, 10), boxAt(0, 0), new Vector(0, 0))).toBe(false);
    });
});

describe('distanceToBox', () => {
    it('measures distance from a point to the nearest edge, zero inside', () => {
        const box = boxAt(0, 0, 10, 20);
        expect(distanceToBox(box, point(2, 3))).toBe(0);
        expect(distanceToBox(box, point(8, 0))).toBe(3);
        expect(distanceToBox(box, point(8, 14))).toBe(5);
    });
});

describe('segmentCircleEntry', () => {
    it('finds how far along the path it first touches the circle', () => {
        expect(segmentCircleEntry(point(0, 0), point(100, 0), circleAt(50, 0, 10))).toBeCloseTo(0.4);
    });

    it('reports a hit straight away when the path starts inside', () => {
        expect(segmentCircleEntry(point(50, 0), point(100, 0), circleAt(50, 0, 10))).toBe(0);
    });

    it('misses circles off to the side or beyond the end of the path', () => {
        expect(segmentCircleEntry(point(0, 0), point(100, 0), circleAt(50, 30, 10))).toBe(NO_HIT);
        expect(segmentCircleEntry(point(0, 0), point(30, 0), circleAt(50, 0, 10))).toBe(NO_HIT);
        expect(segmentCircleEntry(point(0, 0), point(0, 0), circleAt(50, 0, 10))).toBe(NO_HIT);
    });
});

describe('segmentBoxEntry', () => {
    it('finds how far along the path it enters the box', () => {
        expect(segmentBoxEntry(point(0, 0), point(100, 0), boxAt(50, 0, 20, 20))).toBeCloseTo(0.4);
    });

    it('misses boxes the path passes by', () => {
        expect(segmentBoxEntry(point(0, 0), point(100, 0), boxAt(50, 30, 20, 20))).toBe(NO_HIT);
        expect(segmentBoxEntry(point(0, 0), point(30, 0), boxAt(50, 0, 20, 20))).toBe(NO_HIT);
    });
});
