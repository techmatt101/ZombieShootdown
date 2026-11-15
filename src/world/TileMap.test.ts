import { describe, expect, it } from 'vitest';
import { CHUNK_SIZE, TILE_SIZE } from './constants';
import { createRandom } from './random';
import { TileMap } from './TileMap';
import { TileType } from './TileType';
import { chunksFromRows, generatedChunks } from '../testing/worldFixtures';

const centreOf = (tileX : number, tileY : number) => ({ x: (tileX + 0.5) * TILE_SIZE, y: (tileY + 0.5) * TILE_SIZE });

describe('TileMap', () => {
    const rows = [
        '#####',
        '#...#',
        '#.D.#',
        '#...#',
        '#####',
    ];

    it('reads tiles and treats anything not floor, or not loaded, as solid', () => {
        const tileMap = new TileMap(chunksFromRows(rows));
        expect(tileMap.tileAt(1, 1)).toBe(TileType.FLOOR);
        expect(tileMap.tileAt(2, 2)).toBe(TileType.DOOR);
        expect(tileMap.isSolidTile(1, 1)).toBe(false);
        expect(tileMap.isSolidTile(2, 2)).toBe(true);
        expect(tileMap.isSolidTile(0, 0)).toBe(true);
        expect(tileMap.tileAt(-40, 900)).toBe(TileType.ROCK);
        expect(tileMap.isSolidTile(-40, 900)).toBe(true);
    });

    it('writes tiles and bumps its version so caches refresh', () => {
        const tileMap = new TileMap(chunksFromRows(rows));
        const before = tileMap.version;
        tileMap.setTile(2, 2, TileType.FLOOR);
        expect(tileMap.isSolidTile(2, 2)).toBe(false);
        expect(tileMap.version).toBeGreaterThan(before);
    });

    it('sees across open floor but not through solid tiles', () => {
        const tileMap = new TileMap(chunksFromRows(rows));
        expect(tileMap.hasLineOfSight(centreOf(1, 1), centreOf(3, 1))).toBe(true);
        expect(tileMap.hasLineOfSight(centreOf(2, 1), centreOf(2, 3))).toBe(false);
        expect(tileMap.raycast(centreOf(1, 1).x, centreOf(1, 1).y, 1, 0, 1000)).toBeCloseTo(TILE_SIZE * 2.5);
    });

    it('forgets a chunk once it is unloaded', () => {
        const chunks = chunksFromRows(rows);
        const tileMap = new TileMap(chunks);
        expect(tileMap.tileAt(1, 1)).toBe(TileType.FLOOR);
        chunks.unload(0, 0);
        expect(tileMap.tileAt(1, 1)).toBe(TileType.ROCK);
    });

    it('finds open floor within a radius, and a random one from it', () => {
        const tileMap = new TileMap(generatedChunks(11, 1));
        const centre = { x: CHUNK_SIZE / 2, y: CHUNK_SIZE / 2 };
        const nearby = tileMap.openFloorNear(centre, 300);
        expect(nearby.length).toBeGreaterThan(0);
        for (let i = 0; i < nearby.length; i++) {
            expect(Math.hypot(nearby[i].x - centre.x, nearby[i].y - centre.y)).toBeLessThanOrEqual(300);
            expect(tileMap.isSolidTile(Math.floor(nearby[i].x / TILE_SIZE), Math.floor(nearby[i].y / TILE_SIZE))).toBe(false);
        }
        const chosen = tileMap.randomOpenFloorNear(centre, 300, createRandom(1));
        expect(nearby.some((point) => point.equal(chosen!))).toBe(true);
        expect(tileMap.randomOpenFloorNear({ x: 1e7, y: 1e7 }, 10, createRandom(1))).toBeNull();
    });

    it('spawns the player on open floor in the starting chunk', () => {
        const tileMap = new TileMap(generatedChunks(11, 1));
        const spawn = tileMap.spawnPoint();
        expect(spawn.x).toBeGreaterThanOrEqual(0);
        expect(spawn.x).toBeLessThan(CHUNK_SIZE);
        expect(tileMap.isSolidTile(Math.floor(spawn.x / TILE_SIZE), Math.floor(spawn.y / TILE_SIZE))).toBe(false);
    });

    it('lists wall corners within a radius', () => {
        const tileMap = new TileMap(generatedChunks(11, 1));
        let count = 0;
        tileMap.forEachCornerNear(0, 0, 400, (x, y) => {
            count++;
            expect(Math.hypot(x, y)).toBeLessThanOrEqual(400);
        });
        expect(count).toBeGreaterThan(0);
    });
});
