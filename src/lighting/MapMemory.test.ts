import { describe, expect, it } from 'vitest';
import { MapMemory, MEMORY_SIZE } from './MapMemory';
import { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';
import { recordingContext } from '../testing/fakeCanvas';
import { generatedChunks } from '../testing/worldFixtures';
import { CHUNK_SIZE } from '../world/constants';

const SEED = 1234;
const SEEN_PIXEL = 7;

function canvasFactory() {
    const made : ReturnType<typeof recordingContext>[] = [];
    const create = (size : number) => {
        const recording = recordingContext();
        made.push(recording);
        return { width: size, height: size, getContext: () => recording.context } as unknown as OffscreenCanvas;
    };
    return { made, create };
}

function cameraOn(x : number, y : number) {
    const camera = new Camera(new Vector(600, 300));
    camera.setTarget(new Vector(x, y));
    camera.jumpToTarget();
    return camera;
}

const acrossFirstTwoChunks = new Float32Array([600, 100, 800, 100, 700, 300]);

describe('MapMemory', () => {
    it('remembers what was seen in each loaded chunk the view overlaps, at low resolution', () => {
        const canvases = canvasFactory();
        const memory = new MapMemory(generatedChunks(SEED, 1), canvases.create);
        memory.reveal(acrossFirstTwoChunks);
        expect(canvases.made.length).toBe(2);
        const transforms = canvases.made.map(({ calls }) => calls.find((call) => call.method === 'setTransform')?.args);
        expect(transforms).toContainEqual([1 / 7, 0, 0, 1 / 7, -0, -0]);
        expect(transforms).toContainEqual([1 / 7, 0, 0, 1 / 7, -MEMORY_SIZE, -0]);
        expect(canvases.made[0].count('fill')).toBe(1);
    });

    it('reuses a chunk memory as the view moves around inside it', () => {
        const canvases = canvasFactory();
        const memory = new MapMemory(generatedChunks(SEED, 1), canvases.create);
        memory.reveal(new Float32Array([100, 100, 200, 100, 150, 200]));
        memory.reveal(new Float32Array([300, 300, 400, 300, 350, 400]));
        expect(canvases.made.length).toBe(1);
        expect(canvases.made[0].count('fill')).toBe(2);
    });

    it('ignores chunks that are not loaded', () => {
        const canvases = canvasFactory();
        const memory = new MapMemory(generatedChunks(SEED, 1), canvases.create);
        memory.reveal(new Float32Array([5000, 5000, 5100, 5000, 5050, 5100]));
        expect(canvases.made.length).toBe(0);
    });

    it('draws only remembered chunks in view, stretched over the whole chunk', () => {
        const canvases = canvasFactory();
        const memory = new MapMemory(generatedChunks(SEED, 1), canvases.create);
        memory.reveal(new Float32Array([100, 100, 200, 100, 150, 200]));
        const { context, calls } = recordingContext();
        memory.draw(context, cameraOn(0, 0));
        const draws = calls.filter((call) => call.method === 'drawImage');
        expect(draws.length).toBe(1);
        expect(draws[0].args.slice(1)).toEqual([0, 0, CHUNK_SIZE, CHUNK_SIZE]);
    });

    it('keeps what was seen in a compact form while a chunk is unloaded, and restores it when it streams back', () => {
        const chunks = generatedChunks(SEED, 1);
        const canvases = canvasFactory();
        const memory = new MapMemory(chunks, canvases.create);
        memory.reveal(new Float32Array([100, 100, 200, 100, 150, 200]));
        const seenPixels = new Uint8ClampedArray(MEMORY_SIZE * MEMORY_SIZE * 4);
        seenPixels[SEEN_PIXEL * 4 + 3] = 255;
        canvases.made[0].context.getImageData = () => ({ data: seenPixels }) as ImageData;

        const chunk = chunks.chunkAt(0, 0)!;
        chunks.unload(0, 0);
        expect(memory.rememberedChunkCount).toBe(1);
        const { context, count } = recordingContext();
        memory.draw(context, cameraOn(0, 0));
        expect(count('drawImage')).toBe(0);

        chunks.load(chunk);
        expect(canvases.made.length).toBe(2);
        const restored = canvases.made[1].calls.find((call) => call.method === 'putImageData')?.args[0] as ImageData;
        expect(restored.data[SEEN_PIXEL * 4 + 3]).toBe(255);
        expect(restored.data[(SEEN_PIXEL + 1) * 4 + 3]).toBe(0);
        expect(memory.rememberedChunkCount).toBe(1);
    });

    it('keeps no memory for chunks that were never seen', () => {
        const chunks = generatedChunks(SEED, 1);
        const canvases = canvasFactory();
        const memory = new MapMemory(chunks, canvases.create);
        chunks.unload(1, 1);
        chunks.load(chunks.chunkAt(0, 0)!);
        expect(memory.rememberedChunkCount).toBe(0);
        expect(canvases.made.length).toBe(0);
    });
});
