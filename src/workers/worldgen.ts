import { generateChunk, type ChunkData } from '../world/generateChunk';
import { renderChunk } from '../world/renderChunk';
import type { TileAtlas } from '../world/tileAtlas';

export type WorldgenRequest =
    | { type : 'atlas'; atlas : TileAtlas }
    | { type : 'chunk'; seed : number; cx : number; cy : number };

export interface WorldgenResponse {
    chunk : ChunkData;
    bitmap : ImageBitmap | null;
    normals : ImageBitmap | null;
}

let atlas : TileAtlas | null = null;

self.addEventListener('message', (e : MessageEvent<WorldgenRequest>) => {
    const request = e.data;
    if (request.type === 'atlas') {
        atlas = request.atlas;
        return;
    }

    const chunk = generateChunk(request.seed, request.cx, request.cy);
    const rendered = atlas === null ? null : renderChunk(chunk, atlas);
    const response : WorldgenResponse = { chunk, bitmap: rendered?.bitmap ?? null, normals: rendered?.normals ?? null };
    const transfer : Transferable[] = [
        chunk.tiles.buffer, chunk.wallDirections.buffer, chunk.floorRotations.buffer,
        chunk.corners.buffer, chunk.openFloor.buffer, chunk.zombieSpawns.buffer, chunk.lampSpawns.buffer,
    ];
    if (rendered !== null) {
        transfer.push(rendered.bitmap, rendered.normals);
    }
    self.postMessage(response, { transfer });
});
