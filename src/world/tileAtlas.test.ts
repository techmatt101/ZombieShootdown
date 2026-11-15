import { afterEach, describe, expect, it, vi } from 'vitest';
import { QUARTER_TURNS, tileAtlasOf, turnNormals } from './tileAtlas';
import { FakeOffscreenCanvas } from '../testing/fakeCanvas';

const FACING_RIGHT = [255, 128, 200, 255];
const FACING_DOWN = [128, 0, 200, 255];
const FACING_LEFT = [0, 127, 200, 255];
const FACING_UP = [127, 255, 200, 255];

function turned(pixel : number[], quarterTurns : number) {
    const pixels = new Uint8ClampedArray(pixel);
    turnNormals(pixels, quarterTurns);
    return [...pixels];
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('turnNormals', () => {
    it('turns each normal clockwise a quarter at a time, like the tile it belongs to', () => {
        expect(turned(FACING_RIGHT, 1)).toEqual(FACING_DOWN);
        expect(turned(FACING_RIGHT, 2)).toEqual(FACING_LEFT);
        expect(turned(FACING_RIGHT, 3)).toEqual(FACING_UP);
        expect(turned(FACING_UP, 1)).toEqual([255, 128, 200, 255]);
    });

    it('leaves normals alone after no turn or a full turn, and keeps depth and alpha', () => {
        expect(turned(FACING_DOWN, 0)).toEqual(FACING_DOWN);
        expect(turned(FACING_DOWN, QUARTER_TURNS)).toEqual(FACING_DOWN);
    });

    it('turns every pixel, not just the first', () => {
        expect(turned([...FACING_RIGHT, ...FACING_UP], 1)).toEqual([...FACING_DOWN, ...FACING_RIGHT]);
    });
});

describe('tileAtlasOf', () => {
    it('keeps the colours and makes a copy of the normals for every quarter turn', () => {
        vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
        const colours = {} as HTMLImageElement;
        const normals = { width: 72, height: 16 } as HTMLImageElement;
        const atlas = tileAtlasOf(colours, normals);
        expect(atlas.colours).toBe(colours);
        expect(atlas.turnedNormals.length).toBe(QUARTER_TURNS);
        for (let i = 0; i < atlas.turnedNormals.length; i++) {
            const canvas = atlas.turnedNormals[i] as unknown as FakeOffscreenCanvas;
            expect(canvas).toMatchObject({ width: 72, height: 16 });
            expect(canvas.recording.count('putImageData')).toBe(1);
        }
    });
});
