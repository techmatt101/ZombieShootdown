import { Entity } from '../Entity';
import { Level } from './Level';
import { MapManager } from './MapManager';
import { Systems } from '../Systems';
import { Camera } from '../../lib/Camera';

export class TopDownLevel extends Level {
    #camera : Camera;
    #map : MapManager;


    constructor(map : MapManager, camera : Camera, systems : Systems<Entity>) {
        super(systems);
        this.#map = map;
        this.#camera = camera;
    }

    getMap() {
        return this.#map;
    }

    getCamera() {
        return this.#camera;
    }

    setObjectToFollow(obj : Entity) {
        this.#camera.setTarget(obj.pos);
    }
}
