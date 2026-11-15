import { Entity } from '../Entity';
import { Systems } from '../Systems';
import type { IUpdate } from '../../lib/IUpdate';

export class Level {
    #entities : Entity[] = [];
    #systems : Systems<IUpdate>;


    constructor(systems : Systems<Entity>) {
        this.#systems = systems;
    }

    getEntities() {
        return this.#entities;
    }

    addEntity(entity : Entity) {
        this.#entities.push(entity);
        this.#systems.add(entity); //TODO: hmmm....
    }

    addEntities(entities : Entity[]) {
        for (var i = 0; i < entities.length; i++) {
            this.addEntity(entities[i]);
        }
    }
}
