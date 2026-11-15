import { Entity } from '../Entity';
import type { ISystem } from './ISystem';
import { Camera } from '../../lib/Camera';

export class DebugSystem implements ISystem<Entity> {
    #enmities : Entity[] = [];
    #camera : Camera;

    constructor(camera : Camera) {
        this.#camera = camera;
    }

    add(entity : Entity) {
        this.#enmities.push(entity);
    }

    update(dt : number) {

    }

    paint(ctx : CanvasRenderingContext2D) {
        ctx.scale(this.#camera.zoom, this.#camera.zoom);
        ctx.translate(~~-this.#camera.viewport.pos.x, ~~-this.#camera.viewport.pos.y);
        for (var i = 0; i < this.#enmities.length; i++) {
            ctx.save();
            this.#enmities[i].drawDebug(ctx);
            ctx.restore();
        }
        ctx.translate(~~this.#camera.viewport.pos.x, ~~this.#camera.viewport.pos.y);
        ctx.scale(1 / this.#camera.zoom, 1 / this.#camera.zoom);
    }
}
