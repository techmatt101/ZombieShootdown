import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DoorSpawner } from './DoorSpawner';
import type { Entity } from '../Entity';
import { spawnPlayer } from '../factories/PlayerFactory';
import { InputState } from '../../lib/controllers/InputState';
import { FakeOffscreenCanvas } from '../../testing/fakeCanvas';
import { levelOn } from '../../testing/levelFixtures';
import { FakeChunkSource } from '../../testing/worldFixtures';
import { DoorSide, generateChunk } from '../../world/generateChunk';
import { TileType } from '../../world/TileType';

vi.mock('../../lib/assets', () => ({ loadImage: () => new Promise(() => {}) }));

beforeEach(() => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function chunkWithDoor(cx : number) {
    return { ...generateChunk(3, cx, 0), doors: [{ side: DoorSide.TOP, start: 5, width: 2 }] };
}

function activeDoors(entities : Entity[]) {
    return entities.filter((entity) => entity.type === 'Door' && entity.active);
}

describe('DoorSpawner', () => {
    it('places a door entity for every doorway in loaded chunks and removes them on unload', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new DoorSpawner(level).useAtlas({} as CanvasImageSource);
        chunks.load(chunkWithDoor(0));
        chunks.load(chunkWithDoor(1));
        expect(activeDoors(level.getEntities()).length).toBe(2);
        chunks.unload(0, 0);
        expect(activeDoors(level.getEntities()).length).toBe(1);
    });

    it('reuses door entities from its pool', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new DoorSpawner(level).useAtlas({} as CanvasImageSource);
        chunks.load(chunkWithDoor(0));
        chunks.unload(0, 0);
        chunks.load(chunkWithDoor(5));
        expect(level.getEntities().filter((entity) => entity.type === 'Door').length).toBe(1);
    });

    it('remembers which doors were left open when a chunk is reloaded', () => {
        const chunks = new FakeChunkSource();
        const { level, tileMap } = levelOn(chunks);
        new DoorSpawner(level).useAtlas({} as CanvasImageSource);
        chunks.load(chunkWithDoor(0));
        const opener = spawnPlayer({ x: -1000, y: -1000 }, new InputState());
        activeDoors(level.getEntities())[0].getComponent('door').toggle(opener);
        expect(tileMap.tileAt(5, 0)).toBe(TileType.FLOOR);

        chunks.unload(0, 0);
        chunks.load(chunkWithDoor(0));
        expect(activeDoors(level.getEntities())[0].getComponent('door').isOpen).toBe(true);
        expect(tileMap.tileAt(5, 0)).toBe(TileType.FLOOR);
    });

    it('places no doors before it has the tile atlas', () => {
        const chunks = new FakeChunkSource();
        const { level } = levelOn(chunks);
        new DoorSpawner(level);
        chunks.load(chunkWithDoor(0));
        expect(activeDoors(level.getEntities()).length).toBe(0);
    });
});
