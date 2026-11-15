import { Material } from '../components/Material';
import { Entity } from '../Entity';
import { CanvasRenderer } from '../render/CanvasRenderer';
import type { ISystem } from './ISystem';

export class RenderSystem implements ISystem<Entity> {
    #entities : Entity[] = [];
    #renderer : CanvasRenderer;


    constructor(renderer : CanvasRenderer) {
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
