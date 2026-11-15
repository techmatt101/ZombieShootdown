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
        ctx.translate(Math.trunc(-this.#camera.viewport.pos.x), Math.trunc(-this.#camera.viewport.pos.y));
        for (const entity of this.#enmities) {
            ctx.save();
            entity.drawDebug(ctx);
            ctx.restore();
        }
        ctx.translate(Math.trunc(this.#camera.viewport.pos.x), Math.trunc(this.#camera.viewport.pos.y));
        ctx.scale(1 / this.#camera.zoom, 1 / this.#camera.zoom);
    }
}
