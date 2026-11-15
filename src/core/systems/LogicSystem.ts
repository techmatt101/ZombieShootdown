import type { Entity } from '../Entity';
import type { ISystem } from './ISystem';

export class LogicSystem implements ISystem<Entity> {
    #entities : Entity[] = [];


    add(entity : Entity) {
        this.#entities.push(entity);
    }

    update(dt : number) {
        const entities = this.#entities;
        for (let i = 0; i < entities.length; i++) {
            entities[i].update(dt);
        }
    }
}
