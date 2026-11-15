import type { Entity } from '../Entity';
import { Level } from './Level';
import type { Systems } from '../Systems';
import type { Camera } from '../../lib/Camera';
import type { ChunkSource } from '../../world/ChunkStreamer';
import type { TileMap } from '../../world/TileMap';

export class TopDownLevel extends Level {
    #camera : Camera;
    #chunks : ChunkSource;
    #tileMap : TileMap;


    constructor(chunks : ChunkSource, tileMap : TileMap, camera : Camera, systems : Systems<Entity>) {
        super(systems);
        this.#chunks = chunks;
        this.#tileMap = tileMap;
        this.#camera = camera;
    }

    getChunks() {
        return this.#chunks;
    }

    getTileMap() {
        return this.#tileMap;
    }

    getCamera() {
        return this.#camera;
    }

    setObjectToFollow(obj : Entity) {
        this.#camera.setTarget(obj.pos);
    }
}
