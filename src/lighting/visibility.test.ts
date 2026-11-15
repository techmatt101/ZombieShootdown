import { describe, expect, it } from 'vitest';
import { computeVisibilityPolygon } from './visibility';
import { chunksFromRows, generatedChunks } from '../testing/worldFixtures';
import { TILE_SIZE } from '../world/constants';
import { TileMap } from '../world/TileMap';

function anglesOf(polygon : Float32Array, originX : number, originY : number) {
    const angles : number[] = [];
    for (let i = 0; i < polygon.length; i += 2) {
        angles.push(Math.atan2(polygon[i + 1] - originY, polygon[i] - originX));
    }
    return angles;
}

describe('computeVisibilityPolygon', () => {
    it('stops at walls, reaching slightly into the lit surface', () => {
        const rows = ['#####', '#...#', '#...#', '#...#', '#####'];
        const tileMap = new TileMap(chunksFromRows(rows));
        const origin = 2.5 * TILE_SIZE;
        const polygon = computeVisibilityPolygon(tileMap, origin, origin, 900);
        for (let i = 0; i < polygon.length; i += 2) {
            const distanceFromCentre = Math.max(Math.abs(polygon[i] - origin), Math.abs(polygon[i + 1] - origin));
            expect(distanceFromCentre).toBeGreaterThanOrEqual(1.5 * TILE_SIZE - 0.001);
            expect(distanceFromCentre).toBeLessThanOrEqual(1.5 * TILE_SIZE + 16.001);
        }
    });

    it('returns points ordered by angle, all within the light radius', () => {
        const tileMap = new TileMap(generatedChunks(5, 2));
        const spawn = tileMap.spawnPoint();
        const radius = 900;
        const polygon = computeVisibilityPolygon(tileMap, spawn.x, spawn.y, radius);
        expect(polygon.length).toBeGreaterThan(0);
        const angles = anglesOf(polygon, spawn.x, spawn.y);
        let wraps = 0;
        for (let i = 1; i < angles.length; i++) {
            if (angles[i] < angles[i - 1] - 1e-6) {
                wraps++;
                expect(angles[i - 1] - angles[i]).toBeGreaterThan(Math.PI);
            }
        }
        expect(wraps).toBeLessThanOrEqual(1);
        for (let i = 0; i < polygon.length; i += 2) {
            expect(Math.hypot(polygon[i] - spawn.x, polygon[i + 1] - spawn.y)).toBeLessThanOrEqual(radius + 0.01);
        }
    });

    it('lights a full circle in open space', () => {
        const rows : string[] = [];
        for (let i = 0; i < 64; i++) rows.push('.'.repeat(64));
        const tileMap = new TileMap(chunksFromRows(rows));
        const polygon = computeVisibilityPolygon(tileMap, 1344, 1344, 300);
        for (let i = 0; i < polygon.length; i += 2) {
            expect(Math.hypot(polygon[i] - 1344, polygon[i + 1] - 1344)).toBeCloseTo(300, 3);
        }
    });
});
