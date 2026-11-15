import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderChunk } from './renderChunk';
import { CHUNK_TILES, tileIndex } from './constants';
import { generateChunk } from './generateChunk';
import { TileType } from './TileType';
import { FakeOffscreenCanvas } from '../testing/fakeCanvas';
import { fakeTileAtlas } from '../testing/worldFixtures';

beforeEach(() => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function drawnFrom(bitmap : ImageBitmap) {
    const calls = (bitmap as unknown as FakeOffscreenCanvas).recording.calls;
    const sources : unknown[] = [];
    for (let i = 0; i < calls.length; i++) {
        if (calls[i].method === 'drawImage') sources.push(calls[i].args[0]);
    }
    return sources;
}

function paintedTiles(chunk : ReturnType<typeof generateChunk>) {
    const tiles : number[] = [];
    for (let y = 0; y < CHUNK_TILES; y++) {
        for (let x = 0; x < CHUNK_TILES; x++) {
            if (chunk.tiles[tileIndex(x, y)] !== TileType.ROCK) tiles.push(tileIndex(x, y));
        }
    }
    return tiles;
}

describe('renderChunk', () => {
    it('paints every tile from the colour atlas', () => {
        const chunk = generateChunk(4, 0, 0);
        const atlas = fakeTileAtlas();
        const { bitmap } = renderChunk(chunk, atlas);
        const sources = drawnFrom(bitmap);
        expect(sources.length).toBe(paintedTiles(chunk).length);
        expect(new Set(sources)).toEqual(new Set([atlas.colours]));
    });

    it('paints a matching normal map, using normals turned the same way as each floor tile', () => {
        const chunk = generateChunk(4, 0, 0);
        const atlas = fakeTileAtlas();
        const { normals } = renderChunk(chunk, atlas);
        const sources = drawnFrom(normals);
        const tiles = paintedTiles(chunk);
        expect(sources.length).toBe(tiles.length);

        const usedTurns = new Set<number>();
        for (let i = 0; i < tiles.length; i++) {
            const tile = chunk.tiles[tiles[i]];
            const isFloor = tile === TileType.FLOOR || tile === TileType.DOOR;
            const quarterTurns = isFloor ? chunk.floorRotations[tiles[i]] : 0;
            expect(sources[i]).toBe(atlas.turnedNormals[quarterTurns]);
            usedTurns.add(quarterTurns);
        }
        expect(usedTurns.size).toBe(4);
    });
});
