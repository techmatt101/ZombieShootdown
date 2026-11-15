import { describe, expect, it } from 'vitest';
import { SpatialHash } from './SpatialHash';

interface Rect { id : number; x : number; y : number; width : number; height : number }

function overlaps(a : Rect, b : Rect) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

describe('SpatialHash', () => {
    it('finds exactly the overlapping pairs a brute-force search finds', () => {
        let state = 42;
        const random = () => (state = (state * 1103515245 + 12345) % 2147483648) / 2147483648;
        const rects : Rect[] = Array.from({ length: 400 }, (_, id) => ({
            id, x: random() * 3000 - 1500, y: random() * 3000 - 1500, width: 10 + random() * 80, height: 10 + random() * 80,
        }));

        const hash = new SpatialHash<Rect>(96);
        for (const rect of rects) hash.insert(rect, rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);

        const found = new Set<string>();
        for (const rect of rects) {
            hash.query(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height, (other) => {
                if (other.id > rect.id && overlaps(rect, other)) found.add(`${rect.id}-${other.id}`);
            });
        }

        const expected = new Set<string>();
        for (const a of rects) for (const b of rects) if (b.id > a.id && overlaps(a, b)) expected.add(`${a.id}-${b.id}`);

        expect(found).toEqual(expected);
        expect(expected.size).toBeGreaterThan(0);
    });

    it('visits each item once per query even when it spans many cells', () => {
        const hash = new SpatialHash<string>(10);
        hash.insert('big', 0, 0, 95, 95);
        const visits : string[] = [];
        hash.query(0, 0, 100, 100, (item) => visits.push(item));
        expect(visits).toEqual(['big']);
    });
});
