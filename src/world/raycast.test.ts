import { describe, expect, it } from 'vitest';
import { CHUNK_TILES, TILE_SIZE, tileIndex } from './constants';
import { generateChunk } from './generateChunk';
import { createRandom } from './random';
import { castRay, hasClearLine } from './raycast';
import { TileType } from './TileType';

const SEED = 77;
const MAX_DISTANCE = 900;

function buildWorld(radiusInChunks : number) {
    const chunks = new Map<string, Uint8Array>();
    for (let cy = -radiusInChunks; cy <= radiusInChunks; cy++) {
        for (let cx = -radiusInChunks; cx <= radiusInChunks; cx++) {
            chunks.set(`${cx},${cy}`, generateChunk(SEED, cx, cy).tiles);
        }
    }
    return (tileX : number, tileY : number) => {
        const cx = Math.floor(tileX / CHUNK_TILES), cy = Math.floor(tileY / CHUNK_TILES);
        const tiles = chunks.get(`${cx},${cy}`);
        return tiles === undefined || tiles[tileIndex(tileX - cx * CHUNK_TILES, tileY - cy * CHUNK_TILES)] !== TileType.FLOOR;
    };
}

function bruteForceDistance(isSolid : (x : number, y : number) => boolean, ox : number, oy : number, dx : number, dy : number) {
    let nearest = MAX_DISTANCE;
    const minTile = Math.floor((Math.min(ox, ox + dx * MAX_DISTANCE)) / TILE_SIZE) - 1;
    const maxTile = Math.floor((Math.max(ox, ox + dx * MAX_DISTANCE)) / TILE_SIZE) + 1;
    const minTileY = Math.floor((Math.min(oy, oy + dy * MAX_DISTANCE)) / TILE_SIZE) - 1;
    const maxTileY = Math.floor((Math.max(oy, oy + dy * MAX_DISTANCE)) / TILE_SIZE) + 1;
    for (let ty = minTileY; ty <= maxTileY; ty++) {
        for (let tx = minTile; tx <= maxTile; tx++) {
            if (!isSolid(tx, ty)) continue;
            const left = tx * TILE_SIZE, right = left + TILE_SIZE, top = ty * TILE_SIZE, bottom = top + TILE_SIZE;
            const entryX = dx === 0 ? -Infinity : Math.min((left - ox) / dx, (right - ox) / dx);
            const exitX = dx === 0 ? (ox >= left && ox <= right ? Infinity : -Infinity) : Math.max((left - ox) / dx, (right - ox) / dx);
            const entryY = dy === 0 ? -Infinity : Math.min((top - oy) / dy, (bottom - oy) / dy);
            const exitY = dy === 0 ? (oy >= top && oy <= bottom ? Infinity : -Infinity) : Math.max((top - oy) / dy, (bottom - oy) / dy);
            const entry = Math.max(entryX, entryY, 0);
            const exit = Math.min(exitX, exitY);
            if (entry <= exit && entry < nearest) nearest = entry;
        }
    }
    return nearest;
}

describe('castRay', () => {
    it('matches a brute-force tile intersection on random rays', () => {
        const isSolid = buildWorld(2);
        const random = createRandom(5);
        let checked = 0;
        while (checked < 2000) {
            const ox = (random() - 0.5) * CHUNK_TILES * TILE_SIZE * 3;
            const oy = (random() - 0.5) * CHUNK_TILES * TILE_SIZE * 3;
            if (isSolid(Math.floor(ox / TILE_SIZE), Math.floor(oy / TILE_SIZE))) continue;
            const angle = random() * Math.PI * 2;
            const dx = Math.cos(angle), dy = Math.sin(angle);
            expect(castRay(isSolid, ox, oy, dx, dy, MAX_DISTANCE)).toBeCloseTo(bruteForceDistance(isSolid, ox, oy, dx, dy), 6);
            checked++;
        }
    });

    it('returns zero when starting inside a solid tile', () => {
        expect(castRay(() => true, 10, 10, 1, 0, MAX_DISTANCE)).toBe(0);
    });

    it('stops at max distance in open space', () => {
        expect(castRay(() => false, 0, 0, 0.6, 0.8, 300)).toBe(300);
    });
});

describe('hasClearLine', () => {
    it('is blocked by a wall between the points and clear otherwise', () => {
        const wallAtColumnFive = (tileX : number) => tileX === 5;
        expect(hasClearLine(wallAtColumnFive, TILE_SIZE, TILE_SIZE, TILE_SIZE * 10, TILE_SIZE)).toBe(false);
        expect(hasClearLine(wallAtColumnFive, TILE_SIZE, TILE_SIZE, TILE_SIZE * 4, TILE_SIZE * 3)).toBe(true);
    });
});
