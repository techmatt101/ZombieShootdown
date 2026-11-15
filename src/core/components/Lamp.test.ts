import { describe, expect, it } from 'vitest';
import { brokenLampSputter, Lamp, SPUTTER_DURATION, type LampLook } from './Lamp';
import { Light } from './Light';
import { Material } from './Material';
import { Vector } from '../../lib/geometry/Vector';
import { Texture } from '../../lib/Texture';

const GREEN = { r: 0.4, g: 1, b: 0.3 };

function look() : LampLook {
    const image = { width: 16, height: 16 } as ImageBitmap;
    return { lit: new Texture(image, new Vector(0, 0), 28, 28), broken: new Texture(image, new Vector(0, 0), 28, 28) };
}

function lampWith() {
    const light = new Light(new Vector(0, 0), { radius: 300 });
    const material = new Material();
    const lamp = new Lamp(light, material);
    return { light, material, lamp };
}

describe('brokenLampSputter', () => {
    it('sputters down to darkness once broken', () => {
        expect(brokenLampSputter(0, 0.2, 0)).toBeGreaterThan(0);
        expect(brokenLampSputter(SPUTTER_DURATION, 3, 0)).toBe(0);
        expect(brokenLampSputter(SPUTTER_DURATION * 2, 3, 0)).toBe(0);
    });
});

describe('Lamp', () => {
    it('switches on in its colour, glowing the same colour, with the lit look', () => {
        const { light, material, lamp } = lampWith();
        const lampLook = look();
        lamp.switchOn(lampLook, GREEN, 7, false);
        expect(light.colour).toBe(GREEN);
        expect(light.glowColour).toBe(GREEN);
        expect(material.texture).toBe(lampLook.lit);
        expect(light.intensity).toBeGreaterThan(0);
    });

    it('breaks once, showing broken glass and going dark after sputtering', () => {
        const { light, material, lamp } = lampWith();
        const lampLook = look();
        lamp.switchOn(lampLook, GREEN, 7, false);
        lamp.break();
        expect(lamp.isBroken).toBe(true);
        expect(material.texture).toBe(lampLook.broken);
        lamp.update(SPUTTER_DURATION);
        expect(light.intensity).toBe(0);
        expect(light.isLit).toBe(false);
    });

    it('can be switched on already broken and dark', () => {
        const { light, material, lamp } = lampWith();
        const lampLook = look();
        lamp.switchOn(lampLook, GREEN, 7, true);
        expect(material.texture).toBe(lampLook.broken);
        expect(light.intensity).toBe(0);
    });

    it('is whole again after being reset for reuse', () => {
        const { lamp } = lampWith();
        lamp.switchOn(look(), GREEN, 7, false);
        lamp.break();
        lamp.reset();
        expect(lamp.isBroken).toBe(false);
    });
});
