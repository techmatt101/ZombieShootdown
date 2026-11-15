import { AI } from '../components/AI';
import type { Entity } from '../Entity';
import type { ISystem } from './ISystem';
import type { TileMap } from '../../world/TileMap';

const THINKS_PER_FRAME = 8;

export class AISystem implements ISystem<Entity> {
    #entities : Entity[] = [];
    #tileMap : TileMap;
    #nextIndex = 0;

    constructor(tileMap : TileMap) {
        this.#tileMap = tileMap;
    }

    add(entity : Entity) {
        if (entity.hasComponent(AI)) {
            this.#entities.push(entity);
        }
    }

    update(dt : number) {
        const entities = this.#entities;
        let thinks = 0;
        for (let visited = 0; visited < entities.length && thinks < THINKS_PER_FRAME; visited++) {
            const entity = entities[this.#nextIndex];
            this.#nextIndex = (this.#nextIndex + 1) % entities.length;
            if (entity.hasActiveComponent(AI)) {
                entity.getComponent('ai').getAI().think(this.#tileMap);
                thinks++;
            }
        }
    }
}
