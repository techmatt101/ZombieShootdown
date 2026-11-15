import { Material } from '../components/Material';
import { Entity } from '../Entity';
import type { IFilter } from './filters/IFilter';
import { Camera } from '../../lib/Camera';
import { Canvas } from '../../lib/Canvas';

export class CanvasRenderer {
    #ctx : CanvasRenderingContext2D;
    #canvas : Canvas;
    #camera : Camera;
    #filters : IFilter[] = [];
    #entities : Entity[] = [];


    constructor(canvas : Canvas, camera : Camera) {
        this.#canvas = canvas;
        this.#camera = camera;

        this.#ctx = canvas.context;
    }

    getCtx() {
        return this.#ctx;
    }

    addFilter(filter : IFilter) {
        this.#filters.push(filter);
    }

    render(entities : Entity[]) {
        this.#entities = entities;
    }

    paint() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#ctx.scale(this.#camera.zoom, this.#camera.zoom);
        this.#ctx.translate(~~-this.#camera.viewport.pos.x, ~~-this.#camera.viewport.pos.y);

        for (var i = 0; i < this.#filters.length; i++) {
            this.#filters[i].init(this.#ctx, this.#canvas, this.#camera);
        }

        this.#ctx.fillStyle = '#000';

        for (var i = 0; i < this.#entities.length; i++) {
            if (this.#entities[i].hasActiveComponent(Material)) { //TODO: hmmm...
                this.#drawEntity(this.#entities[i]);
            }
        }

        for (var i = 0; i < this.#filters.length; i++) {
            this.#filters[i].close(this.#ctx, this.#canvas, this.#camera);
        }

        this.#ctx.translate(~~this.#camera.viewport.pos.x, ~~this.#camera.viewport.pos.y);
        this.#ctx.scale(1 / this.#camera.zoom, 1 / this.#camera.zoom);
    }

    #drawEntity(entity : Entity) {
        var texture = entity.components.material?.texture ?? null;

        this.#ctx.save();
        this.#ctx.rotate(entity.pos.direction);

        var rx = Math.cos(-entity.pos.direction),
            ry = Math.sin(-entity.pos.direction);

        if (texture === null) {
            this.#ctx.fillRect(
                (entity.pos.x * rx - entity.pos.y * ry) - entity.geometry.width / 2,
                (entity.pos.y * rx + entity.pos.x * ry) - entity.geometry.height / 2,
                entity.geometry.width, entity.geometry.height
            );
        } else {
            this.#ctx.drawImage(
                texture.img,
                texture.sourcePos.x, texture.sourcePos.y,
                texture.sourceWidth, texture.sourceHeight,
                ((entity.pos.x * rx - entity.pos.y * ry) - entity.geometry.width / 2) + texture.pos.x,
                ((entity.pos.y * rx + entity.pos.x * ry) - entity.geometry.height / 2) + texture.pos.y,
                texture.width, texture.height
            );
        }

        this.#ctx.restore();
    }
}
