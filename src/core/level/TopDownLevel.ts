import { Entity } from '../Entity';
import { Level } from './Level';
import { Systems } from '../Systems';
import { Camera } from '../../lib/Camera';
import type { ChunkStreamer } from '../../world/ChunkStreamer';
import type { TileMap } from '../../world/TileMap';

export class TopDownLevel extends Level {
    #camera : Camera;
    #chunks : ChunkStreamer;
    #tileMap : TileMap;


    constructor(chunks : ChunkStreamer, tileMap : TileMap, camera : Camera, systems : Systems<Entity>) {
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
