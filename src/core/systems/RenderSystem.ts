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
        this.#entities.sort((a : Entity, b : Entity) => { //TODO: hmmm... could be optimized
            return a.components.material!.zIndex - b.components.material!.zIndex; // add() only accepts entities with a Material
        });

        this.#renderer.render(this.#entities);
    }
}
