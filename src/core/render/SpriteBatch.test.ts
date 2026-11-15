import { describe, expect, it } from 'vitest';
import { FLOATS_PER_SPRITE, SpriteBatch, SpriteKind } from './SpriteBatch';

const zombieSheet = { width: 28, height: 40 } as HTMLImageElement;
const playerSheet = { width: 30, height: 89 } as HTMLImageElement;

function runsOf(batch : SpriteBatch) {
    const runs = [];
    for (let i = 0; i < batch.runCount; i++) {
        const { source, kind, first, count } = batch.run(i);
        runs.push({ source, kind, first, count });
    }
    return runs;
}

describe('SpriteBatch', () => {
    it('packs each sprite as placement, rect, crop and tint', () => {
        const batch = new SpriteBatch();
        batch.place(zombieSheet, SpriteKind.SCENE, 10, 20, 0.5, -24, -12, 48, 24);
        batch.crop(0, 0.5, 1, 1);
        batch.tint(0, 0, 0, 0.4);
        expect(batch.count).toBe(1);
        expect([...batch.data.subarray(0, FLOATS_PER_SPRITE)]).toEqual([
            10, 20, 0.5, 0,
            -24, -12, 48, 24,
            0, 0.5, 1, 1,
            0, 0, 0, expect.closeTo(0.4),
        ]);
    });

    it('shows the whole texture untinted unless told otherwise', () => {
        const batch = new SpriteBatch();
        batch.place(zombieSheet, SpriteKind.SCENE, 0, 0, 0, 0, 0, 1, 1);
        expect([...batch.data.subarray(8, FLOATS_PER_SPRITE)]).toEqual([0, 0, 1, 1, 1, 1, 1, 1]);
    });

    it('groups neighbouring sprites that share a texture and kind into one run', () => {
        const batch = new SpriteBatch();
        batch.place(zombieSheet, SpriteKind.SCENE_IN_SIGHT, 0, 0, 0, 0, 0, 1, 1);
        batch.place(zombieSheet, SpriteKind.SCENE_IN_SIGHT, 0, 0, 0, 0, 0, 1, 1);
        batch.place(zombieSheet, SpriteKind.SCENE, 0, 0, 0, 0, 0, 1, 1);
        batch.place(playerSheet, SpriteKind.SCENE, 0, 0, 0, 0, 0, 1, 1);
        batch.place(null, SpriteKind.SCENE, 0, 0, 0, 0, 0, 1, 1);
        expect(runsOf(batch)).toEqual([
            { source: zombieSheet, kind: SpriteKind.SCENE_IN_SIGHT, first: 0, count: 2 },
            { source: zombieSheet, kind: SpriteKind.SCENE, first: 2, count: 1 },
            { source: playerSheet, kind: SpriteKind.SCENE, first: 3, count: 1 },
            { source: null, kind: SpriteKind.SCENE, first: 4, count: 1 },
        ]);
    });

    it('grows to fit any number of sprites, keeping earlier ones', () => {
        const batch = new SpriteBatch();
        for (let i = 0; i < 1000; i++) {
            batch.place(zombieSheet, SpriteKind.SCENE, i, 0, 0, 0, 0, 1, 1);
        }
        expect(batch.count).toBe(1000);
        expect(batch.data[0]).toBe(0);
        expect(batch.data[999 * FLOATS_PER_SPRITE]).toBe(999);
        expect(runsOf(batch)).toEqual([{ source: zombieSheet, kind: SpriteKind.SCENE, first: 0, count: 1000 }]);
    });

    it('starts empty again after a reset, reusing its runs', () => {
        const batch = new SpriteBatch();
        batch.place(zombieSheet, SpriteKind.SCENE, 0, 0, 0, 0, 0, 1, 1);
        const firstRun = batch.run(0);
        batch.reset();
        expect(batch.count).toBe(0);
        expect(batch.runCount).toBe(0);
        batch.place(playerSheet, SpriteKind.ADDITIVE, 0, 0, 0, 0, 0, 1, 1);
        expect(batch.run(0)).toBe(firstRun);
        expect(runsOf(batch)).toEqual([{ source: playerSheet, kind: SpriteKind.ADDITIVE, first: 0, count: 1 }]);
    });
});
