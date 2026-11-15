import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fitLamp, LAMP_COLOURS, lampColourFor, spawnLamp } from './LampFactory';
import { spawnPlayer } from './PlayerFactory';
import { spawnBullet } from './WeaponFactory';
import { CollisionLayer } from '../components/Collision';
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

function litLamp(x = 0, y = 0) {
    const lamp = spawnLamp();
    fitLamp(lamp, x, y, 0, false);
    return lamp;
}

describe('lampColourFor', () => {
    it('picks a spooky colour for every tint roll', () => {
        expect(lampColourFor(0)).toBe(LAMP_COLOURS[0]);
        expect(lampColourFor(0.999)).toBe(LAMP_COLOURS.at(-1));
        expect(lampColourFor(1)).toBe(LAMP_COLOURS.at(-1));
    });
});

describe('spawnLamp', () => {
    it('is a coloured, glowing light that is not the player\'s eyes', () => {
        const lamp = litLamp();
        const light = lamp.getComponent('light');
        expect(light.colour).toBe(LAMP_COLOURS[0]);
        expect(light.glow).toBeGreaterThan(0);
        expect(light.isSight).toBe(false);
        expect(light.isLit).toBe(true);
        expect(lamp.getComponent('material').texture?.normals).not.toBeNull();
    });

    it('casts a small shadow from other lights, but none from its own light inside it', () => {
        const lamp = litLamp(30, 40);
        const caster = lamp.getComponent('shadowCaster');
        expect(caster.pos).toBe(lamp.pos);
        expect(caster.radius).toBeGreaterThan(0);
        expect(caster.radius).toBeLessThan(21);
        expect(lamp.getComponent('light').pos).toBe(lamp.pos);
    });

    it('is a prop that players, zombies, bullets and other lamps all bump into', () => {
        const collision = litLamp().getComponent('collision');
        expect(collision.layer).toBe(CollisionLayer.PROP);
        expect(collision.mask & CollisionLayer.PLAYER).toBeTruthy();
        expect(collision.mask & CollisionLayer.ENEMY).toBeTruthy();
        expect(collision.mask & CollisionLayer.PROJECTILE).toBeTruthy();
        expect(collision.mask & CollisionLayer.PROP).toBeTruthy();
    });

    it('breaks when a bullet hits it', () => {
        const lamp = litLamp(100, 0);
        const bullet = spawnBullet();
        const system = new CollisionSystem();
        system.add(lamp);
        system.add(bullet);
        bullet.getComponent('movement').stepStart.set(0, 0);
        bullet.pos.set(200, 0);
        system.update(1);
        expect(lamp.getComponent('lamp').isBroken).toBe(true);
        expect(bullet.active).toBe(false);
    });

    it('gets shoved by the player walking into it', () => {
        const lamp = litLamp(10, 0);
        const player = spawnPlayer({ x: 0, y: 0 }, new InputState());
        const system = new CollisionSystem();
        system.add(player);
        system.add(lamp);
        system.update(1);
        expect(lamp.pos.x).toBeGreaterThan(10);
    });

    it('is placed whole or broken, as remembered', () => {
        const lamp = spawnLamp();
        fitLamp(lamp, 40, 50, 0.5, true);
        expect(lamp.pos).toMatchObject({ x: 40, y: 50 });
        expect(lamp.getComponent('lamp').isBroken).toBe(true);
        fitLamp(lamp, 40, 50, 0.5, false);
        expect(lamp.getComponent('lamp').isBroken).toBe(false);
        expect(lamp.getComponent('health').isDead).toBe(false);
    });
});
