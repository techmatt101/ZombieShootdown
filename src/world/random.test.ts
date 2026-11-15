import { describe, expect, it } from 'vitest';
import { createRandom, hashCoords, randomInt } from './random';

describe('hashCoords', () => {
    it('is deterministic and sensitive to every input and its order', () => {
        expect(hashCoords(1, 2, 3)).toBe(hashCoords(1, 2, 3));
        expect(hashCoords(1, 2, 3)).not.toBe(hashCoords(1, 2, 4));
        expect(hashCoords(1, 2, 3)).not.toBe(hashCoords(3, 2, 1));
        expect(hashCoords(-1, 0)).not.toBe(hashCoords(1, 0));
    });

    it('returns an unsigned 32-bit integer', () => {
        const hash = hashCoords(-123456, 987654);
        expect(Number.isInteger(hash)).toBe(true);
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(hash).toBeLessThan(2 ** 32);
    });
});

describe('createRandom', () => {
    it('repeats the same sequence for the same seed', () => {
        const first = createRandom(42), second = createRandom(42);
        for (let i = 0; i < 100; i++) {
            expect(first()).toBe(second());
        }
    });

    it('produces values in [0, 1) spread across the range', () => {
        const random = createRandom(7);
        const buckets = new Uint32Array(10);
        for (let i = 0; i < 10000; i++) {
            const value = random();
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
            buckets[Math.floor(value * 10)]++;
        }
        for (let i = 0; i < buckets.length; i++) {
            expect(buckets[i]).toBeGreaterThan(800);
        }
    });
});

describe('randomInt', () => {
    it('stays within the inclusive range and reaches both ends', () => {
        const random = createRandom(3);
        const seen = new Set<number>();
        for (let i = 0; i < 1000; i++) {
            const value = randomInt(random, 2, 5);
            expect(value).toBeGreaterThanOrEqual(2);
            expect(value).toBeLessThanOrEqual(5);
            seen.add(value);
        }
        expect(seen.size).toBe(4);
    });
});
