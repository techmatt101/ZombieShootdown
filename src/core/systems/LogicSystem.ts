import { Entity } from '../Entity';
import type { ISystem } from './ISystem';

export class LogicSystem implements ISystem<Entity> {
    #entities : Entity[] = [];


    add(entity : Entity) {
        this.#entities.push(entity);
    }

    update(dt : number) {
        for (var i = 0; i < this.#entities.length; i++) {
            this.#entities[i].update(dt);
        }
    }
}
