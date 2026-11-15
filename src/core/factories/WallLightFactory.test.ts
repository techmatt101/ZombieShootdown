import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { spawnLamp } from './LampFactory';
import { spawnPlayer } from './PlayerFactory';
import { fitWallLight, spawnWallLight, WALL_LIGHT_COLOURS, wallLightColourFor } from './WallLightFactory';
import { spawnBullet } from './WeaponFactory';
import { spawnZombie } from './EnemyFactory';
import { CollisionSystem } from '../systems/CollisionSystem';
import { InputState } from '../../lib/controllers/InputState';
import { FakeOffscreenCanvas } from '../../testing/fakeCanvas';

vi.mock('../../lib/assets', () => ({ loadImage: () => new Promise(() => {}) }));

beforeEach(() => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function mountedLight(x = 100, y = 200, facing = Math.PI / 2, tintRoll = 0, isBroken = false) {
    const wallLight = spawnWallLight();
    fitWallLight(wallLight, x, y, facing, tintRoll, isBroken);
    return wallLight;
}

describe('wallLightColourFor', () => {
    it('picks an old-bulb colour for every tint roll', () => {
        expect(wallLightColourFor(0)).toBe(WALL_LIGHT_COLOURS[0]);
        expect(wallLightColourFor(0.999)).toBe(WALL_LIGHT_COLOURS.at(-1));
        expect(wallLightColourFor(1)).toBe(WALL_LIGHT_COLOURS.at(-1));
    });
});

describe('spawnWallLight', () => {
    it('shines a cone into the room the way it faces, from where it is mounted', () => {
        const wallLight = mountedLight(100, 200, Math.PI / 2, 0.6);
        const light = wallLight.getComponent('light');
        expect(light.pos).toBe(wallLight.pos);
        expect(wallLight.pos).toMatchObject({ x: 100, y: 200, direction: Math.PI / 2 });
        expect(light.cone?.aim).toBe(wallLight.pos);
        expect(light.cone!.halfAngle).toBeGreaterThan(1);
        expect(light.cone!.halfAngle).toBeLessThan(Math.PI / 2);
        expect(light.colour).toBe(wallLightColourFor(0.6));
        expect(light.isSight).toBe(false);
    });

    it('is dimmer and shorter-reaching than a lamp', () => {
        const wall = mountedLight().getComponent('light');
        const lamp = spawnLamp().getComponent('light');
        expect(wall.radius).toBeLessThan(lamp.radius);
        expect(wall.intensity).toBeLessThanOrEqual(0.55);
        expect(wall.glow).toBe(0);
    });

    it('breaks when a bullet hits it, and sputters out', () => {
        const wallLight = mountedLight(100, 0);
        const bullet = spawnBullet();
        const system = new CollisionSystem();
        system.add(wallLight);
        system.add(bullet);
        bullet.getComponent('movement').stepStart.set(0, 0);
        bullet.pos.set(200, 0);
        system.update(1);
        expect(wallLight.getComponent('lamp').isBroken).toBe(true);
        expect(bullet.active).toBe(false);
        for (let i = 0; i < 20; i++) wallLight.update(1);
        expect(wallLight.getComponent('light').intensity).toBe(0);
    });

    it('stays fixed to the wall: the player and zombies pass it without bumping, and it casts no shadow', () => {
        const wallLight = mountedLight(10, 0);
        const player = spawnPlayer({ x: 0, y: 0 }, new InputState());
        const zombie = spawnZombie(player);
        zombie.pos.set(15, 5);
        const system = new CollisionSystem();
        system.add(wallLight);
        system.add(player);
        system.add(zombie);
        system.update(1);
        expect(wallLight.pos).toMatchObject({ x: 10, y: 0 });
        expect(wallLight.components.movement).toBeUndefined();
        expect(wallLight.components.shadowCaster).toBeUndefined();
        expect(wallLight.getComponent('collision').canCollideWith(player.getComponent('collision'))).toBe(false);
    });

    it('is mounted whole or already broken, as remembered', () => {
        const broken = mountedLight(0, 0, 0, 0.3, true);
        expect(broken.getComponent('lamp').isBroken).toBe(true);
        expect(broken.getComponent('light').intensity).toBe(0);
        fitWallLight(broken, 0, 0, 0, 0.3, false);
        expect(broken.getComponent('lamp').isBroken).toBe(false);
        expect(broken.getComponent('health').isDead).toBe(false);
    });

    it('shows a normal-mapped sconce in its light\'s colour, shared between lights of the same colour', () => {
        const first = mountedLight(0, 0, 0, 0.1).getComponent('material').texture;
        const second = mountedLight(50, 0, 0, 0.1).getComponent('material').texture;
        const other = mountedLight(0, 50, 0, 0.9).getComponent('material').texture;
        const broken = mountedLight(0, 0, 0, 0.1, true).getComponent('material').texture;
        expect(first).not.toBeNull();
        expect(first?.normals).not.toBeNull();
        expect(second).toBe(first);
        expect(other).not.toBe(first);
        expect(broken).not.toBe(first);
    });

    it('flickers out of step with its neighbours', () => {
        const a = mountedLight(100, 200), b = mountedLight(184, 200);
        const intensities = new Set<number>();
        for (let i = 0; i < 5; i++) {
            a.update(1);
            b.update(1);
            intensities.add(Math.round(a.getComponent('light').intensity * 1000));
            intensities.add(Math.round(b.getComponent('light').intensity * 1000));
        }
        expect(intensities.size).toBeGreaterThan(5);
    });
});
