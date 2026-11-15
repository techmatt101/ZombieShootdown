import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WallLightSpawner } from './WallLightSpawner';
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

function chunkWithWallLights(cx : number, wallLights : number[]) {
    return { ...generateChunk(3, cx, 0), wallLightSpawns: new Float32Array(wallLights) };
}

function mountedLights(entities : Entity[]) {
    return entities.filter((entity) => entity.type === 'Wall Light' && entity.active);
}

describe('WallLightSpawner', () => {
    it('mounts a wall light at every spawn in loaded chunks, facing the right way, and takes them down on unload', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new WallLightSpawner(level);
        chunks.load(chunkWithWallLights(0, [100, 120, Math.PI / 2, 0.1, 300, 320, 0, 0.1]));
        chunks.load(chunkWithWallLights(1, [800, 120, Math.PI, 0.7]));
        const mounted = mountedLights(level.getEntities());
        expect(mounted.map((light) => [light.pos.x, light.pos.y, light.pos.direction])).toEqual([
            [100, 120, expect.closeTo(Math.PI / 2)],
            [300, 320, 0],
            [800, 120, expect.closeTo(Math.PI)],
        ]);
        chunks.unload(0, 0);
        expect(mountedLights(level.getEntities()).length).toBe(1);
    });

    it('remembers which wall lights were shot out when their chunk streams back', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new WallLightSpawner(level);
        const chunk = chunks.load(chunkWithWallLights(0, [100, 120, 0, 0.1, 200, 120, 0, 0.1]));
        mountedLights(level.getEntities())[1].getComponent('lamp').break();

        chunks.unload(0, 0);
        chunks.load(chunk);

        const restored = mountedLights(level.getEntities());
        const brokenAt = restored.filter((light) => light.getComponent('lamp').isBroken).map((light) => light.pos.x);
        expect(brokenAt).toEqual([200]);
    });

    it('reuses wall lights from chunks that unloaded', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new WallLightSpawner(level);
        chunks.load(chunkWithWallLights(0, [100, 120, 0, 0.1, 140, 120, 0, 0.1]));
        chunks.unload(0, 0);
        chunks.load(chunkWithWallLights(5, [3500, 120, 0, 0.9]));
        expect(level.getEntities().filter((entity) => entity.type === 'Wall Light').length).toBe(2);
        expect(mountedLights(level.getEntities()).length).toBe(1);
    });

    it('lights nothing in a chunk with no wall lights', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new WallLightSpawner(level);
        chunks.load(chunkWithWallLights(0, []));
        expect(mountedLights(level.getEntities()).length).toBe(0);
    });
});
