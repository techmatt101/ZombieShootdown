import { describe, expect, it, vi } from 'vitest';
import { computeVisibilityPolygon, cornerSight, CornerSight } from './visibility';
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

function isInside(polygon : Float32Array, x : number, y : number) {
    let inside = false;
    for (let i = 0, j = polygon.length - 2; i < polygon.length; j = i, i += 2) {
        const crosses = (polygon[i + 1] > y) !== (polygon[j + 1] > y)
            && x < (polygon[j] - polygon[i]) * (y - polygon[i + 1]) / (polygon[j + 1] - polygon[i + 1]) + polygon[i];
        if (crosses) inside = !inside;
    }
    return inside;
}

const roomWithPillar = [
    '###########',
    '#.........#',
    '#.........#',
    '#.........#',
    '#...#.....#',
    '#.........#',
    '#.........#',
    '#.........#',
    '###########',
];
const LEFT_OF_PILLAR = { x: 1.5 * TILE_SIZE, y: 4.5 * TILE_SIZE };
const RIM_RAYS = 24;

describe('cornerSight', () => {
    const tileMap = new TileMap(chunksFromRows(roomWithPillar));
    const sightOf = (vertexX : number, vertexY : number) => {
        const x = vertexX * TILE_SIZE, y = vertexY * TILE_SIZE;
        return cornerSight(tileMap, x, y, x - LEFT_OF_PILLAR.x, y - LEFT_OF_PILLAR.y);
    };

    it('grazes the near corners of a pillar, where its shadow starts', () => {
        expect(sightOf(4, 4)).toBe(CornerSight.GRAZED);
        expect(sightOf(4, 5)).toBe(CornerSight.GRAZED);
    });

    it('cannot see the far corners of a pillar past the pillar itself', () => {
        expect(sightOf(5, 4)).toBe(CornerSight.HIDDEN);
        expect(sightOf(5, 5)).toBe(CornerSight.HIDDEN);
    });

    it('faces the inside corners of the room', () => {
        expect(sightOf(1, 1)).toBe(CornerSight.FACED);
        expect(sightOf(10, 8)).toBe(CornerSight.FACED);
    });

    it('treats a corner straight along a grid line as grazed, to be safe', () => {
        expect(cornerSight(tileMap, 4 * TILE_SIZE, 4 * TILE_SIZE, 0, 10)).toBe(CornerSight.GRAZED);
    });
});

describe('computeVisibilityPolygon', () => {
    it('casts two rays past grazed corners, one at faced corners, none at hidden ones, plus the rim', () => {
        const tileMap = new TileMap(chunksFromRows(roomWithPillar));
        const raycast = vi.spyOn(tileMap, 'raycast');
        const polygon = computeVisibilityPolygon(tileMap, LEFT_OF_PILLAR.x, LEFT_OF_PILLAR.y, 900);
        const grazedRays = 2 * 2, facedRays = 4;
        expect(raycast).toHaveBeenCalledTimes(grazedRays + facedRays + RIM_RAYS);
        expect(polygon.length / 2).toBe(grazedRays + facedRays + RIM_RAYS);
    });

    it('casts a sharp shadow behind a pillar', () => {
        const tileMap = new TileMap(chunksFromRows(roomWithPillar));
        const polygon = computeVisibilityPolygon(tileMap, LEFT_OF_PILLAR.x, LEFT_OF_PILLAR.y, 900);
        expect(isInside(polygon, 300, 130)).toBe(true);
        expect(isInside(polygon, 300, 150)).toBe(false);
        expect(isInside(polygon, 300, 228)).toBe(false);
        expect(isInside(polygon, 300, 248)).toBe(true);
        expect(isInside(polygon, 380, 189)).toBe(false);
    });

    it('casts the same rays however many times it is asked', () => {
        const tileMap = new TileMap(generatedChunks(5, 2));
        const spawn = tileMap.spawnPoint();
        const first = computeVisibilityPolygon(tileMap, spawn.x, spawn.y, 500);
        computeVisibilityPolygon(tileMap, spawn.x + 300, spawn.y, 600);
        expect(computeVisibilityPolygon(tileMap, spawn.x, spawn.y, 500)).toEqual(first);
    });

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

    it('limits a cone of light to its arc, starting from the light itself', () => {
        const tileMap = new TileMap(chunksFromRows(roomWithPillar));
        const arc = { direction: 0, halfAngle: 0.4 };
        const polygon = computeVisibilityPolygon(tileMap, LEFT_OF_PILLAR.x, LEFT_OF_PILLAR.y, 900, arc);
        expect([polygon[0], polygon[1]]).toEqual([LEFT_OF_PILLAR.x, LEFT_OF_PILLAR.y]);
        const angles = anglesOf(polygon.subarray(2), LEFT_OF_PILLAR.x, LEFT_OF_PILLAR.y);
        for (let i = 0; i < angles.length; i++) {
            expect(Math.abs(angles[i])).toBeLessThanOrEqual(0.4 + 1e-6);
        }
        expect(angles[0]).toBeCloseTo(-0.4, 5);
        expect(angles.at(-1)).toBeCloseTo(0.4, 5);
        expect(polygon.length).toBeLessThan(computeVisibilityPolygon(tileMap, LEFT_OF_PILLAR.x, LEFT_OF_PILLAR.y, 900).length);
    });

    it('wraps a cone aimed straight behind across the turn of the circle', () => {
        const rows : string[] = [];
        for (let i = 0; i < 32; i++) rows.push('.'.repeat(32));
        const tileMap = new TileMap(chunksFromRows(rows));
        const polygon = computeVisibilityPolygon(tileMap, 672, 672, 300, { direction: Math.PI, halfAngle: 0.3 });
        const angles = anglesOf(polygon.subarray(2), 672, 672);
        for (let i = 0; i < angles.length; i++) {
            expect(Math.abs(Math.abs(angles[i]) - Math.PI)).toBeLessThanOrEqual(0.3 + 1e-6);
        }
        expect(angles.length).toBeGreaterThanOrEqual(2);
    });
});
