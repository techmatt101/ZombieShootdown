import { generateChunk, type ChunkData } from '../world/generateChunk';
import { renderChunk } from '../world/renderChunk';

export type WorldgenRequest =
    | { type : 'atlas'; atlas : ImageBitmap }
    | { type : 'chunk'; seed : number; cx : number; cy : number };

export interface WorldgenResponse {
    chunk : ChunkData;
    bitmap : ImageBitmap | null;
}

let atlas : ImageBitmap | null = null;

self.addEventListener('message', (e : MessageEvent<WorldgenRequest>) => {
    const request = e.data;
    if (request.type === 'atlas') {
        atlas = request.atlas;
        return;
    }

    const chunk = generateChunk(request.seed, request.cx, request.cy);
    const bitmap = atlas === null ? null : renderChunk(chunk, atlas);
    const response : WorldgenResponse = { chunk, bitmap };
    const transfer : Transferable[] = [
        chunk.tiles.buffer, chunk.wallDirections.buffer, chunk.floorRotations.buffer,
        chunk.corners.buffer, chunk.openFloor.buffer, chunk.zombieSpawns.buffer,
    ];
    if (bitmap !== null) {
        transfer.push(bitmap);
    }
    self.postMessage(response, { transfer });
});
