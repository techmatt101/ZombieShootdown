import { ChunkEvent, type Chunk, type ChunkSource } from '../world/ChunkStreamer';
import { CHUNK_SIZE, chunkKey } from '../world/constants';
import type { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';

const WORLD_PIXELS_PER_MEMORY_PIXEL = 7;
export const MEMORY_SIZE = CHUNK_SIZE / WORLD_PIXELS_PER_MEMORY_PIXEL;
const MEMORY_SCALE = 1 / WORLD_PIXELS_PER_MEMORY_PIXEL;
const HALF_CHUNK = CHUNK_SIZE / 2;
const RGBA_CHANNELS = 4;
const ALPHA_CHANNEL = 3;
const SEEN = '#000';

export type MemoryCanvasFactory = (size : number) => OffscreenCanvas;

interface ChunkMemory {
    canvas : OffscreenCanvas;
    ctx : OffscreenCanvasRenderingContext2D;
}

export class MapMemory {
    #chunks : ChunkSource;
    #createCanvas : MemoryCanvasFactory;
    #live = new Map<string, ChunkMemory>();
    #stored = new Map<string, Uint8Array>();
    #chunkCentre = new Vector(0, 0);

    constructor(chunks : ChunkSource, createCanvas : MemoryCanvasFactory = (size) => new OffscreenCanvas(size, size)) {
        this.#chunks = chunks;
        this.#createCanvas = createCanvas;
        chunks.on(ChunkEvent.LOADED, (chunk : Chunk) => this.#restore(chunk.key));
        chunks.on(ChunkEvent.UNLOADED, (chunk : Chunk) => this.#store(chunk.key));
    }

    get rememberedChunkCount() {
        return this.#live.size + this.#stored.size;
    }

    reveal(polygon : Float32Array) {
        if (polygon.length < 6) return;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < polygon.length; i += 2) {
            minX = Math.min(minX, polygon[i]);
            maxX = Math.max(maxX, polygon[i]);
            minY = Math.min(minY, polygon[i + 1]);
            maxY = Math.max(maxY, polygon[i + 1]);
        }
        const lastCy = Math.floor(maxY / CHUNK_SIZE), lastCx = Math.floor(maxX / CHUNK_SIZE);
        for (let cy = Math.floor(minY / CHUNK_SIZE); cy <= lastCy; cy++) {
            for (let cx = Math.floor(minX / CHUNK_SIZE); cx <= lastCx; cx++) {
                if (this.#chunks.chunkAt(cx, cy) === undefined) continue;
                this.#fillSeen(this.#memoryFor(chunkKey(cx, cy)), polygon, cx, cy);
            }
        }
    }

    draw(ctx : CanvasRenderingContext2D, camera : Camera) {
        const chunks = this.#chunks.chunks();
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const memory = this.#live.get(chunk.key);
            if (memory === undefined) continue;
            const left = chunk.cx * CHUNK_SIZE, top = chunk.cy * CHUNK_SIZE;
            this.#chunkCentre.set(left + HALF_CHUNK, top + HALF_CHUNK);
            if (camera.isInCurrentView(this.#chunkCentre, HALF_CHUNK)) {
                ctx.drawImage(memory.canvas, left, top, CHUNK_SIZE, CHUNK_SIZE);
            }
        }
    }

    #fillSeen(memory : ChunkMemory, polygon : Float32Array, cx : number, cy : number) {
        const ctx = memory.ctx;
        ctx.setTransform(MEMORY_SCALE, 0, 0, MEMORY_SCALE, -cx * MEMORY_SIZE, -cy * MEMORY_SIZE);
        ctx.fillStyle = SEEN;
        ctx.beginPath();
        ctx.moveTo(polygon[0], polygon[1]);
        for (let i = 2; i < polygon.length; i += 2) {
            ctx.lineTo(polygon[i], polygon[i + 1]);
        }
        ctx.fill();
    }

    #memoryFor(key : string) {
        return this.#live.get(key) ?? this.#restore(key) ?? this.#createMemory(key);
    }

    #createMemory(key : string) {
        const canvas = this.#createCanvas(MEMORY_SIZE);
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
            throw new Error('OffscreenCanvas 2D context is not supported');
        }
        const memory = { canvas, ctx };
        this.#live.set(key, memory);
        return memory;
    }

    #store(key : string) {
        const memory = this.#live.get(key);
        if (memory === undefined) return;
        const pixels = memory.ctx.getImageData(0, 0, MEMORY_SIZE, MEMORY_SIZE).data;
        const seen = new Uint8Array(MEMORY_SIZE * MEMORY_SIZE);
        for (let i = 0; i < seen.length; i++) {
            seen[i] = pixels[i * RGBA_CHANNELS + ALPHA_CHANNEL];
        }
        this.#stored.set(key, seen);
        this.#live.delete(key);
    }

    #restore(key : string) {
        const seen = this.#stored.get(key);
        if (seen === undefined) return undefined;
        this.#stored.delete(key);
        const memory = this.#createMemory(key);
        const image = memory.ctx.createImageData(MEMORY_SIZE, MEMORY_SIZE);
        for (let i = 0; i < seen.length; i++) {
            image.data[i * RGBA_CHANNELS + ALPHA_CHANNEL] = seen[i];
        }
        memory.ctx.putImageData(image, 0, 0);
        return memory;
    }
}
