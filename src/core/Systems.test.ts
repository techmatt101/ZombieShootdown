import { describe, expect, it } from 'vitest';
import { Entity } from './Entity';
import { Level } from './level/Level';
import { Systems } from './Systems';
import type { ISystem } from './systems/ISystem';
import { LogicSystem } from './systems/LogicSystem';
import { Movement } from './components/Movement';
import { Box } from '../lib/geometry/Box';
import { Point } from '../lib/geometry/Point';

class RecordingSystem implements ISystem<Entity> {
    added : Entity[] = [];
    updates = 0;
    add(entity : Entity) {
        this.added.push(entity);
    }
    update() {
        this.updates++;
    }
}

describe('Systems and Level', () => {
    it('registers entities added to a level with every scheduled system', () => {
        const systems = new Systems<Entity>();
        const first = new RecordingSystem(), second = new RecordingSystem();
        systems.schedule(first);
        systems.schedule(second);
        const level = new Level(systems);
        const entity = new Entity('Test', new Point(0, 0, 0), new Box(1, 1));
        level.addEntities([entity]);
        expect(level.getEntities()).toEqual([entity]);
        expect(first.added).toEqual([entity]);
        expect(second.added).toEqual([entity]);
        systems.update(1);
        expect([first.updates, second.updates]).toEqual([1, 1]);
    });

    it('updates every entity through the logic system', () => {
        const logic = new LogicSystem();
        const entity = new Entity('Mover', new Point(0, 0, 0), new Box(1, 1));
        const movement = entity.addComponent(new Movement(entity.pos, 10, 1));
        entity.build();
        movement.direction.set(1, 0);
        logic.add(entity);
        logic.update(1);
        expect(entity.pos.x).toBeCloseTo(10);
    });
});
