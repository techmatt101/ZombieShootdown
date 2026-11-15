import { describe, expect, it } from 'vitest';
import { RenderSystem } from './RenderSystem';
import { Material } from '../components/Material';
import { Entity } from '../Entity';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';

function sprite(zIndex : number) {
    const entity = new Entity('Sprite', new Point(0, 0, 0), new Box(40, 40));
    const material = entity.addComponent(new Material());
    material.zIndex = zIndex;
    entity.build();
    return entity;
}

describe('RenderSystem', () => {
    it('hands the renderer its entities sorted by z-index', () => {
        let rendered : readonly Entity[] = [];
        const system = new RenderSystem({ render: (entities) => { rendered = entities; } });
        const top = sprite(10), bottom = sprite(0);
        system.add(top);
        system.add(bottom);
        system.add(new Entity('No material', new Point(0, 0, 0), new Box(1, 1)));
        system.update(1);
        expect(rendered).toEqual([bottom, top]);
    });
});
