import { Material } from '../components/Material';
import type { Entity } from '../Entity';
import type { ISystem } from './ISystem';

export interface EntityRenderer {
    render(entities : readonly Entity[]) : void;
}

export class RenderSystem implements ISystem<Entity> {
    #entities : Entity[] = [];
    #renderer : EntityRenderer;


    constructor(renderer : EntityRenderer) {
        this.#renderer = renderer;
    }

    add(entity : Entity) {
        if (entity.hasComponent(Material)) {
            this.#entities.push(entity);
        }
    }

    update(dt : number) {
        this.#entities.sort((a, b) => a.getComponent('material').zIndex - b.getComponent('material').zIndex);

        this.#renderer.render(this.#entities);
    }
}
