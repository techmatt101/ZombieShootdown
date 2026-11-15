import { fillPolygon } from './fillPolygon';
import { ChunkEvent, type Chunk, type ChunkSource } from '../world/ChunkStreamer';
import { CHUNK_SIZE, chunkKey } from '../world/constants';
import type { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';

const WORLD_PIXELS_PER_MEMORY_PIXEL = 7;
export const MEMORY_SIZE = CHUNK_SIZE / WORLD_PIXELS_PER_MEMORY_PIXEL;
const HALF_CHUNK = CHUNK_SIZE / 2;

export interface RememberedChunk {
    key : string;
    left : number;
    top : number;
    mask : Uint8Array;
    version : number;
}

export class MapMemory {
    #chunks : ChunkSource;
    #live = new Map<string, RememberedChunk>();
    #stored = new Map<string, RememberedChunk>();
    #chunkCentre = new Vector(0, 0);

    constructor(chunks : ChunkSource) {
        this.#chunks = chunks;
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
                const memory = this.#memoryFor(cx, cy);
                fillPolygon(memory.mask, MEMORY_SIZE, polygon, memory.left, memory.top, WORLD_PIXELS_PER_MEMORY_PIXEL);
                memory.version++;
            }
        }
    }

    rememberedInView(camera : Camera, out : RememberedChunk[]) {
        out.length = 0;
        const chunks = this.#chunks.chunks();
        for (let i = 0; i < chunks.length; i++) {
            const memory = this.#live.get(chunks[i].key);
            if (memory === undefined) continue;
            this.#chunkCentre.set(memory.left + HALF_CHUNK, memory.top + HALF_CHUNK);
            if (camera.isInCurrentView(this.#chunkCentre, HALF_CHUNK)) {
                out.push(memory);
            }
        }
    }

    #memoryFor(cx : number, cy : number) {
        const key = chunkKey(cx, cy);
        return this.#live.get(key) ?? this.#restore(key) ?? this.#createMemory(key, cx, cy);
    }

    #createMemory(key : string, cx : number, cy : number) {
        const memory : RememberedChunk = {
            key,
            left: cx * CHUNK_SIZE,
            top: cy * CHUNK_SIZE,
            mask: new Uint8Array(MEMORY_SIZE * MEMORY_SIZE),
            version: 0,
        };
        this.#live.set(key, memory);
        return memory;
    }

    #store(key : string) {
        const memory = this.#live.get(key);
        if (memory === undefined) return;
        this.#live.delete(key);
        this.#stored.set(key, memory);
    }

    #restore(key : string) {
        const memory = this.#stored.get(key);
        if (memory === undefined) return undefined;
        this.#stored.delete(key);
        this.#live.set(key, memory);
        return memory;
    }
}
