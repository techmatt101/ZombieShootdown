import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fitDoor, spawnDoor } from './DoorFactory';
import { spawnZombie } from './EnemyFactory';
import { animateFiring, spawnPlayer, spawnTorch } from './PlayerFactory';
import { spawnBullet } from './WeaponFactory';
import { AI } from '../components/AI';
import { CollisionLayer } from '../components/Collision';
import { Movement } from '../components/Movement';
import type { Gun } from '../gameobjects/Gun';
import { InputState } from '../../lib/controllers/InputState';
import { Vector } from '../../lib/geometry/Vector';
import { Texture } from '../../lib/Texture';
import { FakeOffscreenCanvas } from '../../testing/fakeCanvas';
import { chunksFromRows, fakeTileAtlas } from '../../testing/worldFixtures';
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
        expect(player.getComponent('light')).toMatchObject({ pos: player.pos, isSight: true, colour: { r: 0, g: 0, b: 0 }, cone: null });
    });

    it('sees everything in line of sight across the whole screen, without lighting any of it', () => {
        const player = spawnPlayer({ x: 50, y: 60 }, new InputState());
        const eyes = player.getComponent('light');
        expect(eyes.radius).toBeGreaterThanOrEqual(1200);
        expect([eyes.colour.r, eyes.colour.g, eyes.colour.b]).toEqual([0, 0, 0]);
    });

    it('carries a torch: a long, bright cone of light aimed wherever the player faces', () => {
        const player = spawnPlayer({ x: 50, y: 60 }, new InputState());
        const torch = spawnTorch(player).getComponent('light');
        expect(torch.pos).toBe(player.pos);
        expect(torch.isSight).toBe(false);
        expect(torch.intensity).toBeGreaterThanOrEqual(1);
        expect(torch.cone?.aim).toBe(player.pos);
        expect(torch.cone?.halfAngle).toBeLessThan(Math.PI / 4);
    });

    it('shines like an old torch: yellowish, brightest in the middle of the beam, fading fast with distance', () => {
        const torch = spawnTorch(spawnPlayer({ x: 0, y: 0 }, new InputState())).getComponent('light');
        expect(torch.colour.r).toBeGreaterThan(torch.colour.b);
        expect(torch.colour.g).toBeGreaterThan(torch.colour.b);
        expect(torch.cone?.softEdge).toBeGreaterThan((torch.cone?.halfAngle ?? 0) / 2);
        expect(torch.fade).toBeGreaterThan(1);
    });

    it('flickers like a torch on its last batteries', () => {
        const torch = spawnTorch(spawnPlayer({ x: 0, y: 0 }, new InputState()));
        const light = torch.getComponent('light');
        const brightnesses = new Set<number>();
        for (let i = 0; i < 20; i++) {
            torch.update(0.3);
            brightnesses.add(Math.round(light.intensity * 100));
        }
        expect(torch.components.flicker).toBeDefined();
        expect(brightnesses.size).toBeGreaterThan(5);
    });

    it('plays its firing frames each time its gun fires, then rests on the idle frame', () => {
        const frameHeight = 18, idleFrameTop = 72;
        const player = spawnPlayer({ x: 0, y: 0 }, new InputState());
        const fired : (() => void)[] = [];
        animateFiring(player, { on: (event : unknown, listener : () => void) => fired.push(listener) } as unknown as Gun);
        const texture = new Texture({ width: 30, height: 90 } as ImageBitmap, new Vector(0, 0), 78, 47, new Vector(0, idleFrameTop), 30, frameHeight);
        player.getComponent('material').setTexture(texture);
        const animator = player.getComponent('spriteAnimator');

        animator.update(1);
        expect(texture.sourcePos.y).toBe(idleFrameTop);
        fired[0]();
        animator.update(0.1);
        expect(texture.sourcePos.y).toBe(0);
        animator.update(0.5);
        expect(texture.sourcePos.y).toBe(frameHeight);
        animator.update(5);
        expect(texture.sourcePos.y).toBe(idleFrameTop);
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
        fitDoor(door, chunk, chunk.doors[0], false, fakeTileAtlas());
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
        fitDoor(door, chunk, chunk.doors[0], true, fakeTileAtlas());
        expect(door.geometry).toMatchObject({ width: TILE_SIZE, height: 2 * TILE_SIZE });
        expect(door.getComponent('door').isOpen).toBe(true);
        expect(tileMap.tileAt(0, 5)).toBe(TileType.FLOOR);
    });

    it('paints a normal map for each door, turned the same way as the door', () => {
        const chunk = { ...generateChunk(1, 0, 0), doors: [{ side: DoorSide.LEFT, start: 5, width: 2 }, { side: DoorSide.TOP, start: 4, width: 2 }] };
        const atlas = fakeTileAtlas();
        const tileMap = new TileMap(chunksFromRows(['................']));
        const sideDoor = spawnDoor(tileMap), topDoor = spawnDoor(tileMap);
        fitDoor(sideDoor, chunk, chunk.doors[0], false, atlas);
        fitDoor(topDoor, chunk, chunk.doors[1], false, atlas);

        const paintedFrom = (door : typeof sideDoor) => {
            const texture = door.getComponent('material').texture!;
            const normals = texture.normals as unknown as FakeOffscreenCanvas;
            return {
                colours: (texture.img as unknown as FakeOffscreenCanvas).recording.calls.find((call) => call.method === 'drawImage')?.args[0],
                normals: normals.recording.calls.find((call) => call.method === 'drawImage')?.args[0],
            };
        };
        expect(paintedFrom(sideDoor)).toEqual({ colours: atlas.colours, normals: atlas.turnedNormals[1] });
        expect(paintedFrom(topDoor)).toEqual({ colours: atlas.colours, normals: atlas.turnedNormals[0] });
    });
});
