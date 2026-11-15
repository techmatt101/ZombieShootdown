import { describe, expect, it } from 'vitest';
import { Flicker, flickerAt } from './Flicker';
import { Light } from './Light';
import { Vector } from '../../lib/geometry/Vector';

describe('flickerAt', () => {
    it('hums close to full brightness, never brighter', () => {
        for (let time = 0; time < 200; time += 0.37) {
            const brightness = flickerAt(time, 3);
            expect(brightness).toBeLessThanOrEqual(1);
            expect(brightness).toBeGreaterThan(0.3);
        }
    });

    it('now and then stutters dimly', () => {
        let lowest = 1;
        for (let time = 0; time < 2000; time += 0.1) {
            lowest = Math.min(lowest, flickerAt(time, 3));
        }
        expect(lowest).toBeLessThan(0.5);
    });

    it('flickers differently for each seed', () => {
        expect(flickerAt(5, 1)).not.toBeCloseTo(flickerAt(5, 2), 3);
    });
});

describe('Flicker', () => {
    it('flickers its light around the brightness it is given', () => {
        const light = new Light(new Vector(0, 0), { radius: 700 });
        const flicker = new Flicker(light, 2, 4);
        const seen = new Set<number>();
        for (let i = 0; i < 50; i++) {
            flicker.update(0.3);
            expect(light.intensity).toBeLessThanOrEqual(2);
            expect(light.intensity).toBeGreaterThan(0.6);
            seen.add(Math.round(light.intensity * 100));
        }
        expect(seen.size).toBeGreaterThan(5);
    });

    it('starts again from the beginning when reset', () => {
        const light = new Light(new Vector(0, 0), { radius: 700 });
        const flicker = new Flicker(light, 1);
        const first = light.intensity;
        flicker.update(7);
        flicker.reset();
        expect(light.intensity).toBe(first);
    });
});
