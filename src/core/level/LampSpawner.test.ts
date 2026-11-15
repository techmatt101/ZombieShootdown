import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LampSpawner } from './LampSpawner';
import type { Entity } from '../Entity';
import { FakeOffscreenCanvas } from '../../testing/fakeCanvas';
import { levelOn } from '../../testing/levelFixtures';
import { FakeChunkSource } from '../../testing/worldFixtures';
import { generateChunk } from '../../world/generateChunk';

vi.mock('../../lib/assets', () => ({ loadImage: () => new Promise(() => {}) }));

beforeEach(() => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function chunkWithLamps(cx : number, lamps : number[]) {
    return { ...generateChunk(3, cx, 0), lampSpawns: new Float32Array(lamps) };
}

function activeLamps(entities : Entity[]) {
    return entities.filter((entity) => entity.type === 'Lamp' && entity.active);
}

describe('LampSpawner', () => {
    it('lights a lamp at every lamp spawn in loaded chunks and puts them away on unload', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new LampSpawner(level);
        chunks.load(chunkWithLamps(0, [100, 120, 0.1, 300, 320, 0.9]));
        chunks.load(chunkWithLamps(1, [800, 120, 0.5]));
        expect(activeLamps(level.getEntities()).map((lamp) => [lamp.pos.x, lamp.pos.y])).toEqual([[100, 120], [300, 320], [800, 120]]);
        chunks.unload(0, 0);
        expect(activeLamps(level.getEntities()).length).toBe(1);
    });

    it('remembers where a lamp was pushed and whether it was broken when its chunk streams back', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new LampSpawner(level);
        const chunk = chunks.load(chunkWithLamps(0, [100, 120, 0.1]));
        const [lamp] = activeLamps(level.getEntities());
        lamp.pos.set(150, 160);
        lamp.getComponent('lamp').break();

        chunks.unload(0, 0);
        chunks.load(chunk);

        const [restored] = activeLamps(level.getEntities());
        expect([restored.pos.x, restored.pos.y]).toEqual([150, 160]);
        expect(restored.getComponent('lamp').isBroken).toBe(true);
    });

    it('reuses lamps from chunks that unloaded', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new LampSpawner(level);
        chunks.load(chunkWithLamps(0, [100, 120, 0.1]));
        chunks.unload(0, 0);
        chunks.load(chunkWithLamps(1, [800, 120, 0.5]));
        expect(level.getEntities().filter((entity) => entity.type === 'Lamp').length).toBe(1);
    });
});
