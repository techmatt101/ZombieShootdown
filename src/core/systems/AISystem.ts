import { AI } from '../components/AI';
import { Entity } from '../Entity';
import { MapManager } from '../level/MapManager';
import type { ISystem } from './ISystem';

export class AISystem implements ISystem<Entity> {
    #entities : Entity[] = [];
    #map : MapManager;
    #index = 0;


    constructor(map : MapManager) {
        this.#map = map;
    }

    add(entity : Entity) {
        if (entity.hasComponent(AI)) {
            this.#entities.push(entity);
        }
    }

    update(dt : number) {
        if (this.#entities.length === 0) return;
        this.#entities[this.#index].components.ai?.getAI().updatePathFind(this.#map.segments);
        this.#index++;
        if (this.#index >= this.#entities.length) {
            this.#index = 0;
        }
    }
}
