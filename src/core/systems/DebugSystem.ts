import type { Entity } from '../Entity';
import type { ISystem } from './ISystem';
import type { Camera } from '../../lib/Camera';

export class DebugSystem implements ISystem<Entity> {
    #entities : Entity[] = [];
    #camera : Camera;

    constructor(camera : Camera) {
        this.#camera = camera;
    }

    add(entity : Entity) {
        this.#entities.push(entity);
    }

    update(dt : number) {
    }

    paint(ctx : CanvasRenderingContext2D) {
        ctx.scale(this.#camera.zoom, this.#camera.zoom);
        ctx.translate(Math.trunc(-this.#camera.view.left), Math.trunc(-this.#camera.view.top));
        const entities = this.#entities;
        for (let i = 0; i < entities.length; i++) {
            ctx.save();
            entities[i].drawDebug(ctx);
            ctx.restore();
        }
        ctx.translate(Math.trunc(this.#camera.view.left), Math.trunc(this.#camera.view.top));
        ctx.scale(1 / this.#camera.zoom, 1 / this.#camera.zoom);
    }
}
