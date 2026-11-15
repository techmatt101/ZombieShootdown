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

    it('leaves out lights that cannot reach the camera view', () => {
        let received : readonly Light[] = [];
        const nearby = lit(1), faraway = lit(1);
        faraway.entity.pos.set(5000, 0);
        const view = { isInCurrentOrUpcomingView: (point : { x : number }, margin : number) => Math.abs(point.x) <= 600 + margin };
        const system = new LightingSystem({ setLights: (lights) => { received = [...lights]; } }, view);
        system.add(nearby.entity);
        system.add(faraway.entity);
        system.update(1);
        expect(received).toEqual([nearby.light]);
    });
});
