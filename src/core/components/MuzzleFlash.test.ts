import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Light } from './Light';
import { Material } from './Material';
import { FLASH_LIGHT_DURATION, MuzzleFlash } from './MuzzleFlash';
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

function setUp() {
    const muzzle = new Point(100, 50, Math.PI / 2);
    const glowPos = new Point(0, 0, 0);
    const material = new Material();
    const light = new Light(new Point(0, 0, 0), { radius: 600, intensity: 0 });
    const muzzleFlash = new MuzzleFlash(light, { pos: glowPos, material, muzzle, reach: 7 });
    muzzleFlash.reset();
    return { muzzle, glowPos, material, light, muzzleFlash };
}

describe('MuzzleFlash', () => {
    it('stays dark and hidden until the gun fires', () => {
        const { light, material, muzzleFlash } = setUp();
        expect(light.isLit).toBe(false);
        expect(material.active).toBe(false);
        expect(muzzleFlash.isFlashing).toBe(false);
    });

    it('lights up the surroundings and shows the glow at full strength on each shot, then fades both out', () => {
        const { light, material, muzzleFlash } = setUp();
        muzzleFlash.trigger();
        expect(light.intensity).toBe(1);
        expect(material.active).toBe(true);
        expect(material.opacity).toBe(1);
        muzzleFlash.update(FLASH_LIGHT_DURATION / 2);
        expect(light.intensity).toBeCloseTo(0.25);
        expect(material.opacity).toBeCloseTo(0.25);
        muzzleFlash.update(FLASH_LIGHT_DURATION);
        expect(light.isLit).toBe(false);
        expect(material.active).toBe(false);
        expect(muzzleFlash.isFlashing).toBe(false);
    });

    it('keeps the glow at the tip of the barrel while the gun moves', () => {
        const { muzzle, glowPos, muzzleFlash } = setUp();
        muzzleFlash.trigger();
        expect(glowPos.x).toBeCloseTo(100);
        expect(glowPos.y).toBeCloseTo(57);
        muzzle.set(200, 50);
        muzzleFlash.update(FLASH_LIGHT_DURATION / 4);
        expect(glowPos.x).toBeCloseTo(200);
    });

    it('goes dark when reset mid-flash', () => {
        const { light, material, muzzleFlash } = setUp();
        muzzleFlash.trigger();
        muzzleFlash.reset();
        expect(light.isLit).toBe(false);
        expect(material.active).toBe(false);
    });

    it('flashes whenever the gun actually fires, lighting from the shooter with an additive glow', () => {
        const gun = spawnGun(new Pool<Entity>(() => new Entity('Bullet', new Point(0, 0, 0), new Box(8, 5))));
        const shooter = new Entity('Player', new Point(300, 400, 0), new Box(48, 48));
        const flash = spawnMuzzleFlash(gun, shooter);
        const light = flash.getComponent('light');
        expect(light.pos).toBe(shooter.pos);
        expect(flash.getComponent('material').isAdditive).toBe(true);
        expect(flash.getComponent('material').texture).not.toBeNull();
        const muzzleFlash = flash.getComponent('muzzleFlash');
        expect(muzzleFlash.isFlashing).toBe(false);
        gun.attack();
        expect(muzzleFlash.isFlashing).toBe(true);
        muzzleFlash.update(FLASH_LIGHT_DURATION);
        gun.attack();
        expect(muzzleFlash.isFlashing).toBe(false);
    });
});
