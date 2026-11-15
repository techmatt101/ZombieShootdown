import { ChunkEvent, type Chunk, type ChunkSource } from '../world/ChunkStreamer';
import { CHUNK_SHIFT, CHUNK_TILES, LAST_TILE, TILE_SIZE, chunkKey } from '../world/constants';
import { generateChunk, isCornerVertex, type ChunkData } from '../world/generateChunk';
import { TileType } from '../world/TileType';
import type { Listener } from '../lib/EventHandler';

const TILE_BY_SYMBOL : Record<string, TileType> = {
    ' ': TileType.ROCK,
    '#': TileType.WALL,
    '.': TileType.FLOOR,
    'D': TileType.DOOR,
};

function emptyChunk(cx : number, cy : number) : ChunkData {
    return {
        cx,
        cy,
        tiles: new Uint8Array(CHUNK_TILES * CHUNK_TILES),
        wallDirections: new Uint8Array(CHUNK_TILES * CHUNK_TILES),
        floorRotations: new Uint8Array(CHUNK_TILES * CHUNK_TILES),
        corners: new Float32Array(),
        openFloor: new Float32Array(),
        zombieSpawns: new Float32Array(),
        doors: [],
    };
}

export class FakeChunkSource implements ChunkSource {
    version = 0;
    #chunks = new Map<string, Chunk>();
    #listeners = new Map<ChunkEvent, Listener[]>();

    chunkAt(cx : number, cy : number) {
        return this.#chunks.get(chunkKey(cx, cy));
    }

    chunks() : readonly Chunk[] {
        return [...this.#chunks.values()];
    }

    on(event : ChunkEvent, callback : Listener) {
        const listeners = this.#listeners.get(event) ?? [];
        listeners.push(callback);
        this.#listeners.set(event, listeners);
    }

    load(data : ChunkData) : Chunk {
        const chunk : Chunk = { ...data, key: chunkKey(data.cx, data.cy), bitmap: null, listIndex: this.#chunks.size };
        this.#chunks.set(chunk.key, chunk);
        this.version++;
        this.#fire(ChunkEvent.LOADED, chunk);
        return chunk;
    }

    unload(cx : number, cy : number) {
        const chunk = this.chunkAt(cx, cy);
        if (chunk === undefined) return;
        this.#chunks.delete(chunk.key);
        this.version++;
        this.#fire(ChunkEvent.UNLOADED, chunk);
    }

    #fire(event : ChunkEvent, chunk : Chunk) {
        const listeners = this.#listeners.get(event) ?? [];
        for (let i = 0; i < listeners.length; i++) {
            listeners[i](chunk);
        }
    }
}

export function chunksFromRows(rows : string[]) : FakeChunkSource {
    const source = new FakeChunkSource();
    const chunks = new Map<string, ChunkData>();
    for (let tileY = 0; tileY < rows.length; tileY++) {
        for (let tileX = 0; tileX < rows[tileY].length; tileX++) {
            const cx = tileX >> CHUNK_SHIFT, cy = tileY >> CHUNK_SHIFT;
            const key = chunkKey(cx, cy);
            const chunk = chunks.get(key) ?? emptyChunk(cx, cy);
            chunks.set(key, chunk);
            chunk.tiles[(tileX & LAST_TILE) + ((tileY & LAST_TILE) << CHUNK_SHIFT)] = TILE_BY_SYMBOL[rows[tileY][tileX]];
        }
    }
    const isFloorAt = (tileX : number, tileY : number) => rows[tileY]?.[tileX] === '.';
    for (const chunk of chunks.values()) {
        chunk.corners = cornersOf(chunk, isFloorAt);
        source.load(chunk);
    }
    return source;
}

function cornersOf(chunk : ChunkData, isFloorAt : (tileX : number, tileY : number) => boolean) {
    const corners : number[] = [];
    const originX = chunk.cx * CHUNK_TILES, originY = chunk.cy * CHUNK_TILES;
    for (let y = 0; y <= LAST_TILE; y++) {
        for (let x = 0; x <= LAST_TILE; x++) {
            if (isCornerVertex(isFloorAt, originX + x, originY + y)) {
                corners.push((originX + x) * TILE_SIZE, (originY + y) * TILE_SIZE);
            }
        }
    }
    return new Float32Array(corners);
}

export function generatedChunks(seed : number, radiusInChunks : number) : FakeChunkSource {
    const source = new FakeChunkSource();
    for (let cy = -radiusInChunks; cy <= radiusInChunks; cy++) {
        for (let cx = -radiusInChunks; cx <= radiusInChunks; cx++) {
            source.load(generateChunk(seed, cx, cy));
        }
    }
    return source;
}
