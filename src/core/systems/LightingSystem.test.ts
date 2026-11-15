import { describe, expect, it } from 'vitest';
import { LightingSystem } from './LightingSystem';
import { Light } from '../components/Light';
import { Entity } from '../Entity';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';

function lit(intensity : number) {
    const entity = new Entity('Lamp', new Point(0, 0, 0), new Box(1, 1));
    const light = entity.addComponent(new Light(entity.pos, { radius: 100, intensity }));
    entity.build();
    return { entity, light };
}

describe('LightingSystem', () => {
    it('hands the lighting only the lights that are currently shining', () => {
        let received : readonly Light[] = [];
        const system = new LightingSystem({ setLights: (lights) => { received = [...lights]; } });
        const on = lit(1), off = lit(0), inactive = lit(1);
        inactive.entity.active = false;
        system.add(on.entity);
        system.add(off.entity);
        system.add(inactive.entity);
        system.add(new Entity('No light', new Point(0, 0, 0), new Box(1, 1)));
        system.update(1);
        expect(received).toEqual([on.light]);

        off.light.intensity = 0.5;
        system.update(1);
        expect(received).toEqual([on.light, off.light]);
    });
});
