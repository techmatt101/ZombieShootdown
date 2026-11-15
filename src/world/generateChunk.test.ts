import { describe, expect, it } from 'vitest';
import { CHUNK_TILES, LAST_TILE, tileIndex } from './constants';
import { chunkOpenings, DoorSide, FLOATS_PER_LAMP_SPAWN, generateChunk, type ChunkData } from './generateChunk';
import { createRandom, randomInt } from './random';
import { TileType } from './TileType';

const SEED = 1234;
const SAMPLE_COUNT = 300;

function sampleChunkCoords(count : number) {
    const random = createRandom(99);
    return Array.from({ length: count }, () => ({ cx: randomInt(random, -1000, 1000), cy: randomInt(random, -1000, 1000) }));
}

function tileAt(chunk : ChunkData, x : number, y : number) {
    return chunk.tiles[tileIndex(x, y)];
}

function isPassable(tile : number) {
    return tile === TileType.FLOOR || tile === TileType.DOOR;
}

function floorComponentCount(chunk : ChunkData) {
    const visited = new Uint8Array(CHUNK_TILES * CHUNK_TILES);
    let components = 0;
    for (let start = 0; start < visited.length; start++) {
        if (visited[start] || chunk.tiles[start] !== TileType.FLOOR) continue;
        components++;
        const stack = [start];
        visited[start] = 1;
        while (stack.length > 0) {
            const index = stack.pop()!;
            const x = index % CHUNK_TILES, y = Math.floor(index / CHUNK_TILES);
            for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
                const isInside = nx >= 0 && nx <= LAST_TILE && ny >= 0 && ny <= LAST_TILE;
                const neighbour = tileIndex(nx, ny);
                if (isInside && !visited[neighbour] && chunk.tiles[neighbour] === TileType.FLOOR) {
                    visited[neighbour] = 1;
                    stack.push(neighbour);
                }
            }
        }
    }
    return components;
}

describe('generateChunk', () => {
    it('is deterministic for the same seed and coordinates', () => {
        expect(generateChunk(SEED, 5, -7)).toEqual(generateChunk(SEED, 5, -7));
    });

    it('differs between seeds', () => {
        expect(generateChunk(SEED, 5, -7).tiles).not.toEqual(generateChunk(SEED + 1, 5, -7).tiles);
    });

    it('opens all four edges of the spawn chunk', () => {
        const openings = chunkOpenings(SEED, 0, 0);
        expect([openings.top, openings.bottom, openings.left, openings.right].every((opening) => opening !== null)).toBe(true);
    });

    it('lines up walkable tiles across shared edges with neighbouring chunks', () => {
        for (const { cx, cy } of sampleChunkCoords(SAMPLE_COUNT)) {
            const chunk = generateChunk(SEED, cx, cy);
            const right = generateChunk(SEED, cx + 1, cy);
            const below = generateChunk(SEED, cx, cy + 1);
            for (let i = 0; i <= LAST_TILE; i++) {
                expect(isPassable(tileAt(chunk, LAST_TILE, i))).toBe(isPassable(tileAt(right, 0, i)));
                expect(isPassable(tileAt(chunk, i, LAST_TILE))).toBe(isPassable(tileAt(below, i, 0)));
            }
        }
    });

    it('keeps all floor in a chunk connected', () => {
        for (const { cx, cy } of sampleChunkCoords(SAMPLE_COUNT)) {
            expect(floorComponentCount(generateChunk(SEED, cx, cy))).toBe(1);
        }
    });

    it('never places floor next to undrawn rock, including across chunk borders', () => {
        for (const { cx, cy } of sampleChunkCoords(60)) {
            const neighbourhood = new Map<string, ChunkData>();
            const chunkAt = (x : number, y : number) => {
                const key = `${x},${y}`;
                if (!neighbourhood.has(key)) neighbourhood.set(key, generateChunk(SEED, x, y));
                return neighbourhood.get(key)!;
            };
            const worldTile = (tx : number, ty : number) => {
                const ox = Math.floor(tx / CHUNK_TILES), oy = Math.floor(ty / CHUNK_TILES);
                return tileAt(chunkAt(ox, oy), tx - ox * CHUNK_TILES, ty - oy * CHUNK_TILES);
            };
            for (let y = 0; y <= LAST_TILE; y++) {
                for (let x = 0; x <= LAST_TILE; x++) {
                    const tx = cx * CHUNK_TILES + x, ty = cy * CHUNK_TILES + y;
                    if (!isPassable(worldTile(tx, ty))) continue;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            expect(worldTile(tx + dx, ty + dy)).not.toBe(TileType.ROCK);
                        }
                    }
                }
            }
        }
    });

    it('places doors only across its own top and left doorways', () => {
        let doorCount = 0;
        for (const { cx, cy } of sampleChunkCoords(SAMPLE_COUNT)) {
            const chunk = generateChunk(SEED, cx, cy);
            const openings = chunkOpenings(SEED, cx, cy);
            for (let i = 0; i < chunk.doors.length; i++) {
                const door = chunk.doors[i];
                const opening = door.side === DoorSide.TOP ? openings.top : openings.left;
                expect(opening).toEqual({ start: door.start, width: door.width, hasDoor: true });
                for (let offset = 0; offset < door.width; offset++) {
                    const x = door.side === DoorSide.TOP ? door.start + offset : 0;
                    const y = door.side === DoorSide.TOP ? 0 : door.start + offset;
                    expect(tileAt(chunk, x, y)).toBe(TileType.DOOR);
                }
                doorCount++;
            }
            let doorTiles = 0;
            for (let i = 0; i < chunk.tiles.length; i++) {
                if (chunk.tiles[i] === TileType.DOOR) doorTiles++;
            }
            let expectedDoorTiles = 0;
            for (let i = 0; i < chunk.doors.length; i++) expectedDoorTiles += chunk.doors[i].width;
            expect(doorTiles).toBe(expectedDoorTiles);
        }
        expect(doorCount).toBeGreaterThan(0);
    });

    it('marks the ends of each doorway as light-blocking corners while the door is closed', () => {
        let doorsChecked = 0;
        for (const { cx, cy } of sampleChunkCoords(SAMPLE_COUNT)) {
            const chunk = generateChunk(SEED, cx, cy);
            const corners = new Set<string>();
            for (let i = 0; i < chunk.corners.length; i += 2) corners.add(`${chunk.corners[i]},${chunk.corners[i + 1]}`);
            for (let i = 0; i < chunk.doors.length; i++) {
                const door = chunk.doors[i];
                if (door.side !== DoorSide.TOP) continue;
                const originX = cx * CHUNK_TILES * 42, originY = cy * CHUNK_TILES * 42;
                expect(corners.has(`${originX + door.start * 42},${originY}`)).toBe(true);
                expect(corners.has(`${originX + (door.start + door.width) * 42},${originY}`)).toBe(true);
                doorsChecked++;
            }
        }
        expect(doorsChecked).toBeGreaterThan(0);
    });

    it('never offers a door tile as open floor', () => {
        for (const { cx, cy } of sampleChunkCoords(SAMPLE_COUNT)) {
            const chunk = generateChunk(SEED, cx, cy);
            for (let i = 0; i < chunk.openFloor.length; i += 2) {
                const x = Math.floor(chunk.openFloor[i] / 42) - cx * CHUNK_TILES;
                const y = Math.floor(chunk.openFloor[i + 1] / 42) - cy * CHUNK_TILES;
                expect(tileAt(chunk, x, y)).toBe(TileType.FLOOR);
            }
        }
    });

    it('only spawns zombies on open floor and never in the spawn chunk', () => {
        expect(generateChunk(SEED, 0, 0).zombieSpawns.length).toBe(0);
        for (const { cx, cy } of sampleChunkCoords(SAMPLE_COUNT)) {
            const chunk = generateChunk(SEED, cx, cy);
            const openFloor = new Set<string>();
            for (let i = 0; i < chunk.openFloor.length; i += 2) openFloor.add(`${chunk.openFloor[i]},${chunk.openFloor[i + 1]}`);
            for (let i = 0; i < chunk.zombieSpawns.length; i += 2) {
                expect(openFloor.has(`${chunk.zombieSpawns[i]},${chunk.zombieSpawns[i + 1]}`)).toBe(true);
            }
        }
    });

    it('places at most one lamp per room, on open floor, with a tint roll, the same every time', () => {
        let lampCount = 0;
        for (const { cx, cy } of sampleChunkCoords(SAMPLE_COUNT)) {
            const chunk = generateChunk(SEED, cx, cy);
            expect(generateChunk(SEED, cx, cy).lampSpawns).toEqual(chunk.lampSpawns);
            const openFloor = new Set<string>();
            for (let i = 0; i < chunk.openFloor.length; i += 2) openFloor.add(`${chunk.openFloor[i]},${chunk.openFloor[i + 1]}`);
            for (let i = 0; i < chunk.lampSpawns.length; i += FLOATS_PER_LAMP_SPAWN) {
                expect(openFloor.has(`${chunk.lampSpawns[i]},${chunk.lampSpawns[i + 1]}`)).toBe(true);
                expect(chunk.lampSpawns[i + 2]).toBeGreaterThanOrEqual(0);
                expect(chunk.lampSpawns[i + 2]).toBeLessThan(1);
            }
            expect(chunk.lampSpawns.length / FLOATS_PER_LAMP_SPAWN).toBeLessThanOrEqual(2);
            lampCount += chunk.lampSpawns.length / FLOATS_PER_LAMP_SPAWN;
        }
        expect(lampCount).toBeGreaterThan(0);
    });
});
