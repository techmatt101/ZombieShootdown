import { describe, expect, it } from 'vitest';
import { CHUNK_SIZE } from './constants';
import { generateChunk } from './generateChunk';
import { WorldLayer } from './WorldLayer';
import { FLOATS_PER_SPRITE, SpriteBatch, SpriteKind } from '../core/render/SpriteBatch';
import { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';
import type { TextureSource } from '../lib/Texture';
import { FakeChunkSource } from '../testing/worldFixtures';

const NORMAL_MAPPED = 1;

function worldAround(released : TextureSource[] = []) {
    const chunks = new FakeChunkSource();
    for (let cx = -3; cx <= 3; cx++) {
        const chunk = chunks.load(generateChunk(1, cx, 0));
        chunk.bitmap = { cx, width: CHUNK_SIZE, height: CHUNK_SIZE } as unknown as ImageBitmap;
        chunk.normals = { cx, isNormalMap: true, width: CHUNK_SIZE, height: CHUNK_SIZE } as unknown as ImageBitmap;
    }
    const camera = new Camera({ x: 600, y: 300 });
    camera.setTarget(new Vector(CHUNK_SIZE / 2, CHUNK_SIZE / 2));
    camera.jumpToTarget();
    const layer = new WorldLayer(chunks, camera, { release: (source) => released.push(source) });
    return { chunks, layer };
}

describe('WorldLayer', () => {
    it('queues the bitmap of every chunk in view, and only those, covering the whole chunk', () => {
        const { layer } = worldAround();
        const batch = new SpriteBatch();
        layer.queue(batch);
        const placedAt : number[] = [];
        for (let i = 0; i < batch.count; i++) {
            const offset = i * FLOATS_PER_SPRITE;
            placedAt.push(batch.data[offset]);
            expect([...batch.data.subarray(offset + 1, offset + 8)]).toEqual([0, 0, NORMAL_MAPPED, 0, 0, CHUNK_SIZE, CHUNK_SIZE]);
        }
        expect(placedAt.sort((a, b) => a - b)).toEqual([-CHUNK_SIZE, 0, CHUNK_SIZE]);
        expect(batch.run(0).kind).toBe(SpriteKind.SCENE);
    });

    it('lights each chunk with its own normal map', () => {
        const { chunks, layer } = worldAround();
        const batch = new SpriteBatch();
        layer.queue(batch);
        for (let i = 0; i < batch.runCount; i++) {
            const run = batch.run(i);
            const chunk = chunks.chunks().find((candidate) => candidate.bitmap === run.source)!;
            expect(run.normals).toBe(chunk.normals);
        }
    });

    it('releases a chunk\'s bitmap and normal map textures when the chunk unloads', () => {
        const released : TextureSource[] = [];
        const { chunks } = worldAround(released);
        const { bitmap, normals } = chunks.chunkAt(2, 0)!;
        chunks.unload(2, 0);
        expect(released).toEqual([bitmap, normals]);
    });
});
