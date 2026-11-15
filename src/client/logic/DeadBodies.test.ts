import { describe, expect, it, vi } from 'vitest';
import { DeadBodies } from './DeadBodies';
import { levelOn } from '../../testing/levelFixtures';
import { FakeChunkSource } from '../../testing/worldFixtures';

vi.mock('../../lib/assets', () => ({ loadImage: () => new Promise(() => {}) }));

describe('DeadBodies', () => {
    it('places bodies where zombies fell and recycles the oldest beyond its cap', () => {
        const { level } = levelOn(new FakeChunkSource());
        const bodies = new DeadBodies(level);
        for (let i = 0; i < 70; i++) {
            bodies.place({ x: i, y: 0 });
        }
        const placed = level.getEntities().filter((entity) => entity.type === 'Dead Zombie');
        expect(placed.length).toBe(64);
        expect(placed[0].pos.x).toBe(64);
        expect(placed[5].pos.x).toBe(69);
        expect(placed[6].pos.x).toBe(6);
    });
});
