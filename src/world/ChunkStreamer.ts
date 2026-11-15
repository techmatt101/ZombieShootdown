import { CHUNK_SIZE, chunkKey } from './constants';
import type { ChunkData } from './generateChunk';
import type { WorldgenRequest, WorldgenResponse } from '../workers/worldgen';
import { EventHandler, type IObserver, type Listener } from '../lib/EventHandler';
import type { IVector } from '../lib/geometry/IVector';

export interface Chunk extends ChunkData {
    key : string;
    bitmap : ImageBitmap | null;
    listIndex : number;
}

export enum ChunkEvent {
    LOADED,
    UNLOADED,
}

interface ChunkRange {
    minCx : number;
    maxCx : number;
    minCy : number;
    maxCy : number;
}

const LOAD_MARGIN_CHUNKS = 1;
const UNLOAD_MARGIN_CHUNKS = 2;
const MAX_PENDING_REQUESTS = 4;

export const chunkIndexOf = (position : number) => Math.floor(position / CHUNK_SIZE);

function rangeAround(focus : IVector, halfWidth : number, halfHeight : number, marginChunks : number) : ChunkRange {
    return {
        minCx: chunkIndexOf(focus.x - halfWidth) - marginChunks,
        maxCx: chunkIndexOf(focus.x + halfWidth) + marginChunks,
        minCy: chunkIndexOf(focus.y - halfHeight) - marginChunks,
        maxCy: chunkIndexOf(focus.y + halfHeight) + marginChunks,
    };
}

function isInRange(range : ChunkRange, cx : number, cy : number) {
    return cx >= range.minCx && cx <= range.maxCx && cy >= range.minCy && cy <= range.maxCy;
}

export function isInChunk(chunk : ChunkData, point : IVector) {
    return chunkIndexOf(point.x) === chunk.cx && chunkIndexOf(point.y) === chunk.cy;
}

export class ChunkStreamer implements IObserver<ChunkEvent> {
    readonly seed : number;
    #chunks = new Map<string, Chunk>();
    #chunkList : Chunk[] = [];
    #pending = new Set<string>();
    #worker : Worker | null = null;
    #version = 0;
    #wanted : ChunkRange | null = null;
    #wantedCentre = { cx: 0, cy: 0 };
    #eventHandler = new EventHandler<ChunkEvent>();
    #loadWaiters : Array<{ range : ChunkRange; resolve : () => void }> = [];

    constructor(seed : number) {
        this.seed = seed;
    }

    async start(atlas : ImageBitmapSource) {
        const worker = new Worker(new URL('../workers/worldgen.ts', import.meta.url), { type: 'module' });
        worker.addEventListener('message', (e : MessageEvent<WorldgenResponse>) => this.#onChunkGenerated(e.data));
        const atlasBitmap = await createImageBitmap(atlas);
        const request : WorldgenRequest = { type: 'atlas', atlas: atlasBitmap };
        worker.postMessage(request, [atlasBitmap]);
        this.#worker = worker;
    }

    get version() {
        return this.#version;
    }

    get loadedCount() {
        return this.#chunkList.length;
    }

    get pendingCount() {
        return this.#pending.size;
    }

    chunks() : readonly Chunk[] {
        return this.#chunkList;
    }

    chunkAt(cx : number, cy : number) : Chunk | undefined {
        return this.#chunks.get(chunkKey(cx, cy));
    }

    on(event : ChunkEvent, callback : Listener) {
        this.#eventHandler.add(event, callback);
    }

    off() {
    }

    update(focus : IVector, halfWidth : number, halfHeight : number) {
        const kept = rangeAround(focus, halfWidth, halfHeight, UNLOAD_MARGIN_CHUNKS);
        const chunkList = this.#chunkList;
        for (let i = chunkList.length - 1; i >= 0; i--) {
            if (!isInRange(kept, chunkList[i].cx, chunkList[i].cy)) {
                this.#unload(chunkList[i]);
            }
        }
        this.#wanted = rangeAround(focus, halfWidth, halfHeight, LOAD_MARGIN_CHUNKS);
        this.#wantedCentre = { cx: chunkIndexOf(focus.x), cy: chunkIndexOf(focus.y) };
        this.#requestMissingChunks();
    }

    whenLoadedAround(focus : IVector, halfWidth : number, halfHeight : number) : Promise<void> {
        this.update(focus, halfWidth, halfHeight);
        const range = rangeAround(focus, halfWidth, halfHeight, LOAD_MARGIN_CHUNKS);
        if (this.#isRangeLoaded(range)) {
            return Promise.resolve();
        }
        return new Promise((resolve) => this.#loadWaiters.push({ range, resolve }));
    }

    #requestMissingChunks() {
        const worker = this.#worker;
        const wanted = this.#wanted;
        if (worker === null || wanted === null) return;

        const missing : Array<{ cx : number; cy : number; distance : number }> = [];
        for (let cy = wanted.minCy; cy <= wanted.maxCy; cy++) {
            for (let cx = wanted.minCx; cx <= wanted.maxCx; cx++) {
                const key = chunkKey(cx, cy);
                if (!this.#chunks.has(key) && !this.#pending.has(key)) {
                    missing.push({ cx, cy, distance: Math.hypot(cx - this.#wantedCentre.cx, cy - this.#wantedCentre.cy) });
                }
            }
        }
        missing.sort((a, b) => a.distance - b.distance);

        for (let i = 0; i < missing.length && this.#pending.size < MAX_PENDING_REQUESTS; i++) {
            const { cx, cy } = missing[i];
            this.#pending.add(chunkKey(cx, cy));
            const request : WorldgenRequest = { type: 'chunk', seed: this.seed, cx, cy };
            worker.postMessage(request);
        }
    }

    #onChunkGenerated({ chunk : data, bitmap } : WorldgenResponse) {
        const key = chunkKey(data.cx, data.cy);
        this.#pending.delete(key);
        const chunk : Chunk = { ...data, key, bitmap, listIndex: this.#chunkList.length };
        this.#chunks.set(key, chunk);
        this.#chunkList.push(chunk);
        this.#version++;
        this.#eventHandler.fire(ChunkEvent.LOADED, chunk);
        this.#resolveLoadWaiters();
        this.#requestMissingChunks();
    }

    #unload(chunk : Chunk) {
        this.#chunks.delete(chunk.key);
        this.#removeFromChunkList(chunk);
        chunk.bitmap?.close();
        this.#version++;
        this.#eventHandler.fire(ChunkEvent.UNLOADED, chunk);
    }

    #removeFromChunkList(chunk : Chunk) {
        const chunkList = this.#chunkList;
        const last = chunkList.pop()!;
        if (last !== chunk) {
            chunkList[chunk.listIndex] = last;
            last.listIndex = chunk.listIndex;
        }
    }

    #isRangeLoaded(range : ChunkRange) {
        for (let cy = range.minCy; cy <= range.maxCy; cy++) {
            for (let cx = range.minCx; cx <= range.maxCx; cx++) {
                if (!this.#chunks.has(chunkKey(cx, cy))) {
                    return false;
                }
            }
        }
        return true;
    }

    #resolveLoadWaiters() {
        const waiters = this.#loadWaiters;
        const stillWaiting = [];
        for (let i = 0; i < waiters.length; i++) {
            if (this.#isRangeLoaded(waiters[i].range)) {
                waiters[i].resolve();
            } else {
                stillWaiting.push(waiters[i]);
            }
        }
        this.#loadWaiters = stillWaiting;
    }
}
