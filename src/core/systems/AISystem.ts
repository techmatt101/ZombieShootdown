import { AI } from '../components/AI';
import { Entity } from '../Entity';
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
        const thinkCount = Math.min(THINKS_PER_FRAME, entities.length);
        for (let i = 0; i < thinkCount; i++) {
            const entity = entities[this.#nextIndex];
            if (entity.hasActiveComponent(AI)) {
                entity.getComponent('ai').getAI().think(this.#tileMap);
            }
            this.#nextIndex = (this.#nextIndex + 1) % entities.length;
        }
    }
}
