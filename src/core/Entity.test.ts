import { describe, expect, it } from 'vitest';
import type { IComponent } from './components/IComponent';
import type { IComponentDirectory } from './components/IComponentDirectory';
import { Movement } from './components/Movement';
import { Entity } from './Entity';
import { Box } from '../lib/geometry/Box';
import { Point } from '../lib/geometry/Point';

class Probe implements IComponent {
    active = false;
    updates : number[] = [];
    resets = 0;
    builds = 0;

    update(dt : number) {
        this.updates.push(dt);
    }

    drawDebug() {
    }

    reset() {
        this.resets++;
    }

    build(components : IComponentDirectory) {
        this.builds++;
        void components;
    }
}

function entity() {
    return new Entity('Test', new Point(5, 6, 0), new Box(10, 10));
}

describe('Entity', () => {
    it('shares its position with its geometry', () => {
        const subject = entity();
        subject.pos.set(20, 30);
        expect(subject.geometry.pos).toBe(subject.pos);
    });

    it('returns added components and finds them by type and by key', () => {
        const subject = entity();
        const movement = subject.addComponent(new Movement(subject.pos));
        expect(subject.hasComponent(Movement)).toBe(true);
        expect(subject.getComponent('movement')).toBe(movement);
        expect(() => subject.getComponent('health')).toThrow('Test has no health component');
    });

    it('activates components on build and only updates active ones while the entity is active', () => {
        const subject = entity();
        const probe = subject.addComponent(new Probe());
        subject.update(1);
        expect(probe.updates).toEqual([]);
        subject.build();
        subject.update(2);
        expect(probe.updates).toEqual([2]);
        subject.active = false;
        subject.update(3);
        expect(probe.updates).toEqual([2]);
    });

    it('only reports active components while the entity itself is active', () => {
        const subject = entity();
        subject.addComponent(new Movement(subject.pos));
        expect(subject.hasActiveComponent(Movement)).toBe(true);
        subject.active = false;
        expect(subject.hasActiveComponent(Movement)).toBe(false);
    });

    it('reactivates and resets every component when reused', () => {
        const subject = entity();
        const probe = subject.addComponent(new Probe());
        subject.active = false;
        subject.reset();
        expect(subject.active).toBe(true);
        expect(probe.resets).toBe(1);
    });
});
