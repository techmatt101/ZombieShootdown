import { afterEach, describe, expect, it, vi } from 'vitest';
import { randInt, shuffle } from './helpers';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('randInt', () => {
    it('covers both ends of the inclusive range', () => {
        vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.999999);
        expect(randInt(3, 7)).toBe(3);
        expect(randInt(3, 7)).toBe(7);
    });

    it('handles negative ranges', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(randInt(-5, -1)).toBe(-5);
    });
});

describe('shuffle', () => {
    it('reorders in place without losing or duplicating items', () => {
        const items = [1, 2, 3, 4, 5, 6, 7, 8];
        const result = shuffle(items);
        expect(result).toBe(items);
        expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
});
