import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChunkEvent, ChunkStreamer, isInChunk, type Chunk } from './ChunkStreamer';
import { CHUNK_SIZE } from './constants';
import { generateChunk } from './generateChunk';
import type { WorldgenRequest, WorldgenResponse } from '../workers/worldgen';

class FakeWorker {
    static latest : FakeWorker;
    requests : WorldgenRequest[] = [];
    terminated = false;
    #listener : ((e : { data : WorldgenResponse }) => void) | null = null;

    constructor() {
        FakeWorker.latest = this;
    }

    addEventListener(type : string, listener : (e : { data : WorldgenResponse }) => void) {
        this.#listener = listener;
    }

    terminate() {
        this.terminated = true;
    }

    postMessage(request : WorldgenRequest) {
        this.requests.push(request);
    }

    respondToAll() {
        const pending = this.requests.filter((request) => request.type === 'chunk');
        this.requests = [];
        for (let i = 0; i < pending.length; i++) {
            const request = pending[i];
            if (request.type !== 'chunk') continue;
            const bitmap = { close: vi.fn() } as unknown as ImageBitmap;
            this.#listener?.({ data: { chunk: generateChunk(request.seed, request.cx, request.cy), bitmap } });
        }
    }

    chunkRequests() {
        return this.requests.filter((request) => request.type === 'chunk');
    }
}

beforeEach(() => {
    vi.stubGlobal('Worker', FakeWorker);
    vi.stubGlobal('createImageBitmap', async () => ({}));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

async function startedStreamer() {
    const streamer = new ChunkStreamer(9);
    await streamer.start({} as ImageBitmapSource);
    return streamer;
}

function loadEverything(worker : FakeWorker) {
    for (let round = 0; round < 50 && worker.chunkRequests().length > 0; round++) {
        worker.respondToAll();
    }
}

describe('ChunkStreamer', () => {
    it('sends the tile atlas to the worker on start', async () => {
        await startedStreamer();
        expect(FakeWorker.latest.requests[0].type).toBe('atlas');
    });

    it('limits in-flight requests and asks for the nearest chunks first', async () => {
        const streamer = await startedStreamer();
        streamer.update({ x: CHUNK_SIZE / 2, y: CHUNK_SIZE / 2 }, 600, 300);
        const requested = FakeWorker.latest.chunkRequests();
        expect(requested.length).toBe(4);
        expect(requested[0]).toMatchObject({ cx: 0, cy: 0, seed: 9 });
        expect(streamer.pendingCount).toBe(4);
    });

    it('loads every chunk around the focus and announces each one', async () => {
        const streamer = await startedStreamer();
        const loaded : string[] = [];
        streamer.on(ChunkEvent.LOADED, (chunk : Chunk) => loaded.push(chunk.key));
        const ready = streamer.whenLoadedAround({ x: 0, y: 0 }, 600, 300);
        loadEverything(FakeWorker.latest);
        await ready;
        expect(streamer.loadedCount).toBe(loaded.length);
        expect(streamer.chunkAt(0, 0)).toBeDefined();
        expect(streamer.chunkAt(-1, -1)).toBeDefined();
        expect(streamer.pendingCount).toBe(0);
    });

    it('unloads chunks far from the focus, closing their bitmaps', async () => {
        const streamer = await startedStreamer();
        const unloaded : Chunk[] = [];
        streamer.on(ChunkEvent.UNLOADED, (chunk : Chunk) => unloaded.push(chunk));
        const ready = streamer.whenLoadedAround({ x: 0, y: 0 }, 600, 300);
        loadEverything(FakeWorker.latest);
        await ready;
        const versionBefore = streamer.version;

        streamer.update({ x: CHUNK_SIZE * 50, y: 0 }, 600, 300);
        expect(streamer.chunkAt(0, 0)).toBeUndefined();
        expect(unloaded.length).toBeGreaterThan(0);
        expect(unloaded[0].bitmap?.close).toHaveBeenCalled();
        expect(streamer.version).toBeGreaterThan(versionBefore);
        const chunks = streamer.chunks();
        for (let i = 0; i < chunks.length; i++) {
            expect(chunks[i].listIndex).toBe(i);
        }
    });

    it('stops its worker and drops every chunk when stopped', async () => {
        const streamer = await startedStreamer();
        const ready = streamer.whenLoadedAround({ x: 0, y: 0 }, 600, 300);
        loadEverything(FakeWorker.latest);
        await ready;
        const bitmap = streamer.chunks()[0].bitmap;
        streamer.stop();
        expect(FakeWorker.latest.terminated).toBe(true);
        expect(streamer.loadedCount).toBe(0);
        expect(streamer.chunkAt(0, 0)).toBeUndefined();
        expect(bitmap?.close).toHaveBeenCalled();
        streamer.update({ x: 0, y: 0 }, 600, 300);
        expect(streamer.pendingCount).toBe(0);
    });

    it('knows which chunk a world position falls in', () => {
        const chunk = generateChunk(1, 2, -1);
        expect(isInChunk(chunk, { x: CHUNK_SIZE * 2 + 1, y: -1 })).toBe(true);
        expect(isInChunk(chunk, { x: CHUNK_SIZE * 3, y: -1 })).toBe(false);
    });
});
