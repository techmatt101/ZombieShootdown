import { ChunkEvent, type Chunk, type ChunkSource } from './ChunkStreamer';
import { CHUNK_SIZE } from './constants';
import type { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';
import { SpriteKind, type SpriteBatch, type SpriteLayer, type TextureOwner } from '../core/render/SpriteBatch';

const HALF_CHUNK = CHUNK_SIZE / 2;

export class WorldLayer implements SpriteLayer {
    #chunks : ChunkSource;
    #camera : Camera;
    #chunkCentre = new Vector(0, 0);

    constructor(chunks : ChunkSource, camera : Camera, textures : TextureOwner) {
        this.#chunks = chunks;
        this.#camera = camera;
        chunks.on(ChunkEvent.UNLOADED, (chunk : Chunk) => {
            if (chunk.bitmap !== null) {
                textures.release(chunk.bitmap);
            }
            if (chunk.normals !== null) {
                textures.release(chunk.normals);
            }
        });
    }

    queue(batch : SpriteBatch) {
        const chunks = this.#chunks.chunks();
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (chunk.bitmap === null) continue;
            const left = chunk.cx * CHUNK_SIZE, top = chunk.cy * CHUNK_SIZE;
            this.#chunkCentre.set(left + HALF_CHUNK, top + HALF_CHUNK);
            if (this.#camera.isInCurrentView(this.#chunkCentre, HALF_CHUNK)) {
                batch.place(chunk.bitmap, SpriteKind.SCENE, left, top, 0, 0, 0, CHUNK_SIZE, CHUNK_SIZE);
                if (chunk.normals !== null) {
                    batch.withNormals(chunk.normals);
                }
            }
        }
    }
}
