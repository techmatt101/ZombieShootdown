import { Entity } from '../Entity';
import type { ISystem } from './ISystem';

export class LogicSystem implements ISystem<Entity> {
    #entities : Entity[] = [];


    add(entity : Entity) {
        this.#entities.push(entity);
    }

    update(dt : number) {
        for (const entity of this.#entities) {
            entity.update(dt);
        }
    }
}
