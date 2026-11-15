import type { ChunkSource } from './ChunkStreamer';
import { CHUNK_SIZE } from './constants';
import type { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';

const HALF_CHUNK = CHUNK_SIZE / 2;

export class WorldLayer {
    #chunks : ChunkSource;
    #camera : Camera;
    #chunkCentre = new Vector(0, 0);

    constructor(chunks : ChunkSource, camera : Camera) {
        this.#chunks = chunks;
        this.#camera = camera;
    }

    draw(ctx : CanvasRenderingContext2D) {
        const chunks = this.#chunks.chunks();
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (chunk.bitmap === null) continue;
            const left = chunk.cx * CHUNK_SIZE, top = chunk.cy * CHUNK_SIZE;
            this.#chunkCentre.set(left + HALF_CHUNK, top + HALF_CHUNK);
            if (this.#camera.isInCurrentView(this.#chunkCentre, HALF_CHUNK)) {
                ctx.drawImage(chunk.bitmap, left, top);
            }
        }
    }
}
