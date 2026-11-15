import { describe, expect, it } from 'vitest';
import { MapMemory, MEMORY_SIZE, type RememberedChunk } from './MapMemory';
import { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';
import { generatedChunks } from '../testing/worldFixtures';
import { CHUNK_SIZE } from '../world/constants';

const SEED = 1234;
const MEMORY_PIXEL = CHUNK_SIZE / MEMORY_SIZE;

function cameraOn(x : number, y : number) {
    const camera = new Camera(new Vector(600, 300));
    camera.setTarget(new Vector(x, y));
    camera.jumpToTarget();
    return camera;
}

function inView(memory : MapMemory, camera = cameraOn(0, 0)) {
    const out : RememberedChunk[] = [];
    memory.rememberedInView(camera, out);
    return out;
}

function seenPixels(mask : Uint8Array) {
    let seen = 0;
    for (let i = 0; i < mask.length; i++) {
        if (mask[i] > 0) seen++;
    }
    return seen;
}

const acrossFirstTwoChunks = new Float32Array([600, 100, 800, 100, 700, 300]);
const insideFirstChunk = new Float32Array([100, 100, 200, 100, 150, 200]);

describe('MapMemory', () => {
    it('remembers what was seen in each loaded chunk the view overlaps, at low resolution', () => {
        const memory = new MapMemory(generatedChunks(SEED, 1));
        memory.reveal(acrossFirstTwoChunks);
        const remembered = inView(memory, cameraOn(CHUNK_SIZE, CHUNK_SIZE / 2));
        expect(remembered.map((chunk) => chunk.key).sort()).toEqual(['0,0', '1,0']);
        expect(remembered.every((chunk) => seenPixels(chunk.mask) > 0)).toBe(true);
        expect(remembered.find((chunk) => chunk.key === '1,0')).toMatchObject({ left: CHUNK_SIZE, top: 0, version: 1 });
    });

    it('marks the pixels under the polygon', () => {
        const memory = new MapMemory(generatedChunks(SEED, 1));
        const square = new Float32Array([0, 0, MEMORY_PIXEL * 3, 0, MEMORY_PIXEL * 3, MEMORY_PIXEL * 2, 0, MEMORY_PIXEL * 2]);
        memory.reveal(square);
        const { mask } = inView(memory)[0];
        expect(seenPixels(mask)).toBe(6);
        expect(mask[2 + MEMORY_SIZE]).toBe(255);
    });

    it('keeps adding to a chunk memory as the view moves around inside it', () => {
        const memory = new MapMemory(generatedChunks(SEED, 1));
        memory.reveal(insideFirstChunk);
        const [first] = inView(memory);
        const seenAfterFirst = seenPixels(first.mask);
        memory.reveal(new Float32Array([300, 300, 400, 300, 350, 400]));
        const [second] = inView(memory);
        expect(second).toBe(first);
        expect(second.version).toBe(2);
        expect(seenPixels(second.mask)).toBeGreaterThan(seenAfterFirst);
        expect(memory.rememberedChunkCount).toBe(1);
    });

    it('ignores chunks that are not loaded', () => {
        const memory = new MapMemory(generatedChunks(SEED, 1));
        memory.reveal(new Float32Array([5000, 5000, 5100, 5000, 5050, 5100]));
        expect(memory.rememberedChunkCount).toBe(0);
    });

    it('lists only remembered chunks near the camera', () => {
        const memory = new MapMemory(generatedChunks(SEED, 1));
        memory.reveal(insideFirstChunk);
        expect(inView(memory).length).toBe(1);
        expect(inView(memory, cameraOn(10000, 0)).length).toBe(0);
    });

    it('keeps what was seen while a chunk is unloaded, and restores it when it streams back', () => {
        const chunks = generatedChunks(SEED, 1);
        const memory = new MapMemory(chunks);
        memory.reveal(insideFirstChunk);
        const [seen] = inView(memory);

        const chunk = chunks.chunkAt(0, 0)!;
        chunks.unload(0, 0);
        expect(memory.rememberedChunkCount).toBe(1);
        expect(inView(memory).length).toBe(0);

        chunks.load(chunk);
        expect(inView(memory)).toEqual([seen]);
        expect(memory.rememberedChunkCount).toBe(1);
    });

    it('keeps no memory for chunks that were never seen', () => {
        const chunks = generatedChunks(SEED, 1);
        const memory = new MapMemory(chunks);
        chunks.unload(1, 1);
        chunks.load(chunks.chunkAt(0, 0)!);
        expect(memory.rememberedChunkCount).toBe(0);
    });
});
