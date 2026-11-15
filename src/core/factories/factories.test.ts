import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fitDoor, spawnDoor } from './DoorFactory';
import { spawnZombie } from './EnemyFactory';
import { spawnPlayer } from './PlayerFactory';
import { spawnBullet } from './WeaponFactory';
import { AI } from '../components/AI';
import { CollisionLayer } from '../components/Collision';
import { Movement } from '../components/Movement';
import { InputState } from '../../lib/controllers/InputState';
import { FakeOffscreenCanvas } from '../../testing/fakeCanvas';
import { chunksFromRows } from '../../testing/worldFixtures';
import { TILE_SIZE } from '../../world/constants';
import { DoorSide, generateChunk } from '../../world/generateChunk';
import { TileMap } from '../../world/TileMap';
import { TileType } from '../../world/TileType';

vi.mock('../../lib/assets', () => ({ loadImage: () => new Promise(() => {}) }));

beforeEach(() => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('spawnZombie', () => {
    it('builds an AI-driven enemy that collides with players, enemies and bullets', () => {
        const player = spawnPlayer({ x: 0, y: 0 }, new InputState());
        const zombie = spawnZombie(player);
        const collision = zombie.getComponent('collision');
        expect(zombie.hasActiveComponent(AI)).toBe(true);
        expect(collision.layer).toBe(CollisionLayer.ENEMY);
        expect(collision.canCollideWith(player.getComponent('collision'))).toBe(true);
        expect(zombie.getComponent('movement').speed).toBeGreaterThanOrEqual(14);
        expect(zombie.getComponent('damage').cooldown).toBeGreaterThan(0);
    });
});

describe('spawnPlayer', () => {
    it('places a controllable player that can open doors and be bitten', () => {
        const player = spawnPlayer({ x: 50, y: 60 }, new InputState());
        expect(player.pos).toMatchObject({ x: 50, y: 60 });
        expect(player.hasActiveComponent(Movement)).toBe(true);
        expect(player.getComponent('interactor').behaviours.openDoor?.dominant).toBe(true);
        expect(player.getComponent('collision').behaviours.zombieDamage?.passive).toBe(true);
        expect(player.getComponent('health').value).toBe(400);
        expect(player.getComponent('light')).toMatchObject({ pos: player.pos, radius: 900, intensity: 1, behindWalls: 0.5 });
    });
});

describe('spawnBullet', () => {
    it('only hits enemies and is used up when it hits anything', () => {
        const bullet = spawnBullet();
        const collision = bullet.getComponent('collision');
        const player = spawnPlayer({ x: 0, y: 0 }, new InputState());
        expect(collision.canCollideWith(player.getComponent('collision'))).toBe(false);
        expect(collision.canCollideWith(spawnBullet().getComponent('collision'))).toBe(false);
        collision.setAsCollided();
        expect(bullet.active).toBe(false);
        expect(bullet.available).toBe(true);
    });
});

describe('DoorFactory', () => {
    it('fits a door over its doorway tiles and closes them', () => {
        const chunk = { ...generateChunk(1, 0, 0), doors: [{ side: DoorSide.TOP, start: 4, width: 3 }] };
        const tileMap = new TileMap(chunksFromRows(['................']));
        const door = spawnDoor(tileMap);
        fitDoor(door, chunk, chunk.doors[0], false, {} as CanvasImageSource);
        expect(door.geometry).toMatchObject({ width: 3 * TILE_SIZE, height: TILE_SIZE });
        expect(door.pos).toMatchObject({ x: 5.5 * TILE_SIZE, y: 0.5 * TILE_SIZE });
        expect(tileMap.tileAt(4, 0)).toBe(TileType.DOOR);
        expect(tileMap.tileAt(6, 0)).toBe(TileType.DOOR);
        expect(tileMap.tileAt(7, 0)).toBe(TileType.FLOOR);
        expect(door.getComponent('interactable').behaviours.openDoor?.passive).toBe(true);
    });

    it('fits doors on a left edge vertically, opened if remembered open', () => {
        const chunk = { ...generateChunk(1, 0, 0), doors: [{ side: DoorSide.LEFT, start: 5, width: 2 }] };
        const rows : string[] = [];
        for (let i = 0; i < 16; i++) rows.push('.');
        const tileMap = new TileMap(chunksFromRows(rows));
        const door = spawnDoor(tileMap);
        fitDoor(door, chunk, chunk.doors[0], true, {} as CanvasImageSource);
        expect(door.geometry).toMatchObject({ width: TILE_SIZE, height: 2 * TILE_SIZE });
        expect(door.getComponent('door').isOpen).toBe(true);
        expect(tileMap.tileAt(0, 5)).toBe(TileType.FLOOR);
    });
});
