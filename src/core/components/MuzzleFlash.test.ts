import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Material } from './Material';
import { Light } from './Light';
import { FLASH_DURATION, FLASH_LIGHT_DURATION, MuzzleFlash } from './MuzzleFlash';
import { Entity } from '../Entity';
import { spawnGun, spawnMuzzleFlash } from '../factories/WeaponFactory';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Pool } from '../../lib/Pool';
import { FakeOffscreenCanvas } from '../../testing/fakeCanvas';

beforeEach(() => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function setUp(random = () => 0.5) {
    const muzzle = new Point(100, 50, Math.PI / 2);
    const flash = new Entity('Flash', new Point(0, 0, 0), new Box(32, 20));
    const material = flash.addComponent(new Material());
    const light = flash.addComponent(new Light(new Point(0, 0, 0), { radius: 650, intensity: 0 }));
    const muzzleFlash = flash.addComponent(new MuzzleFlash(flash.pos, material, muzzle, 20, light, random));
    flash.build();
    muzzleFlash.reset();
    return { muzzle, flash, material, muzzleFlash, light };
}

describe('MuzzleFlash', () => {
    it('stays hidden until the gun fires', () => {
        const { material, muzzleFlash } = setUp();
        expect(material.active).toBe(false);
        expect(muzzleFlash.isShowing).toBe(false);
    });

    it('appears in front of the muzzle, facing where the gun points', () => {
        const { flash, material, muzzleFlash } = setUp();
        muzzleFlash.trigger();
        expect(material.active).toBe(true);
        expect(flash.pos.x).toBeCloseTo(100);
        expect(flash.pos.y).toBeCloseTo(70);
        expect(flash.pos.direction).toBeCloseTo(Math.PI / 2);
    });

    it('tilts a little differently each shot, within limits', () => {
        const { flash, muzzleFlash } = setUp(() => 1);
        muzzleFlash.trigger();
        const tilt = flash.pos.direction - Math.PI / 2;
        expect(tilt).toBeGreaterThan(0);
        expect(tilt).toBeCloseTo(0.35);
    });

    it('follows the gun while showing, then disappears', () => {
        const { muzzle, flash, material, muzzleFlash } = setUp();
        muzzleFlash.trigger();
        muzzle.set(200, 50);
        muzzleFlash.update(FLASH_DURATION / 2);
        expect(flash.pos.x).toBeCloseTo(200);
        expect(material.active).toBe(true);
        muzzleFlash.update(FLASH_DURATION);
        expect(material.active).toBe(false);
        expect(muzzleFlash.isShowing).toBe(false);
    });

    it('lights up the surroundings on each shot, then fades the light out after the sprite', () => {
        const { light, material, muzzleFlash } = setUp();
        expect(light.isLit).toBe(false);
        muzzleFlash.trigger();
        expect(light.intensity).toBe(1);
        muzzleFlash.update(FLASH_DURATION);
        expect(material.active).toBe(false);
        expect(light.intensity).toBeGreaterThan(0);
        expect(light.intensity).toBeLessThan(1);
        muzzleFlash.update(FLASH_LIGHT_DURATION);
        expect(light.isLit).toBe(false);
    });

    it('flashes whenever the gun actually fires, lighting from the shooter', () => {
        const gun = spawnGun(new Pool<Entity>(() => new Entity('Bullet', new Point(0, 0, 0), new Box(8, 5))));
        const shooter = new Entity('Player', new Point(300, 400, 0), new Box(48, 48));
        const flash = spawnMuzzleFlash(gun, shooter);
        expect(flash.getComponent('light').pos).toBe(shooter.pos);
        expect(flash.getComponent('light').glow).toBeGreaterThan(0);
        const muzzleFlash = flash.getComponent('muzzleFlash');
        expect(flash.getComponent('material').texture).not.toBeNull();
        expect(muzzleFlash.isShowing).toBe(false);
        gun.attack();
        expect(muzzleFlash.isShowing).toBe(true);
        muzzleFlash.update(FLASH_DURATION);
        gun.attack();
        expect(muzzleFlash.isShowing).toBe(false);
    });
});
