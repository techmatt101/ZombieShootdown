import type { Entity } from '../Entity';
import type { ISystem } from './ISystem';
import type { Camera } from '../../lib/Camera';

export interface DebugOverlay {
    drawDebug(ctx : CanvasRenderingContext2D) : void;
}

export class DebugSystem implements ISystem<Entity> {
    #entities : Entity[] = [];
    #overlays : DebugOverlay[] = [];
    #camera : Camera;

    constructor(camera : Camera) {
        this.#camera = camera;
    }

    add(entity : Entity) {
        this.#entities.push(entity);
    }

    addOverlay(overlay : DebugOverlay) {
        this.#overlays.push(overlay);
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
        const overlays = this.#overlays;
        for (let i = 0; i < overlays.length; i++) {
            overlays[i].drawDebug(ctx);
        }
        ctx.translate(Math.trunc(this.#camera.view.left), Math.trunc(this.#camera.view.top));
        ctx.scale(1 / this.#camera.zoom, 1 / this.#camera.zoom);
    }
}
