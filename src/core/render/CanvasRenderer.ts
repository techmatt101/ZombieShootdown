import { Material } from '../components/Material';
import type { Entity } from '../Entity';
import type { IFilter } from './filters/IFilter';
import type { Camera } from '../../lib/Camera';
import type { Canvas } from '../../lib/Canvas';

const SUBPIXEL_SNAP_MARGIN = 1;

export interface BackgroundLayer {
    draw(ctx : CanvasRenderingContext2D) : void;
}

export interface SightMask {
    clipToSight(ctx : CanvasRenderingContext2D) : void;
}

export class CanvasRenderer {
    #ctx : CanvasRenderingContext2D;
    #canvas : Canvas;
    #camera : Camera;
    #filters : IFilter[] = [];
    #entities : Entity[] = [];
    #background : BackgroundLayer | null = null;
    #sightMask : SightMask | null = null;


    constructor(canvas : Canvas, camera : Camera) {
        this.#canvas = canvas;
        this.#camera = camera;

        this.#ctx = canvas.context;
    }

    getCtx() {
        return this.#ctx;
    }

    setBackground(layer : BackgroundLayer) {
        this.#background = layer;
    }

    setSightMask(mask : SightMask) {
        this.#sightMask = mask;
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
        this.#ctx.translate(Math.trunc(-this.#camera.view.left), Math.trunc(-this.#camera.view.top));

        const filters = this.#filters;
        for (let i = 0; i < filters.length; i++) {
            filters[i].init(this.#ctx, this.#canvas, this.#camera);
        }

        this.#ctx.fillStyle = '#000';
        this.#background?.draw(this.#ctx);

        this.#drawEntities();

        for (let i = 0; i < filters.length; i++) {
            filters[i].close(this.#ctx, this.#canvas, this.#camera);
        }

        this.#ctx.translate(Math.trunc(this.#camera.view.left), Math.trunc(this.#camera.view.top));
        this.#ctx.scale(1 / this.#camera.zoom, 1 / this.#camera.zoom);
    }

    #drawEntities() {
        const ctx = this.#ctx;
        const sightMask = this.#sightMask;
        const entities = this.#entities;
        let isClippedToSight = false;
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (!entity.hasActiveComponent(Material) || !this.#isVisible(entity)) continue;
            const needsSight = sightMask !== null && entity.getComponent('material').isHiddenOutOfSight;
            if (needsSight && !isClippedToSight) {
                ctx.save();
                sightMask.clipToSight(ctx);
            } else if (!needsSight && isClippedToSight) {
                ctx.restore();
            }
            isClippedToSight = needsSight;
            this.#drawEntity(entity);
        }
        if (isClippedToSight) {
            ctx.restore();
        }
    }

    #isVisible(entity : Entity) {
        return this.#camera.isInCurrentView(entity.pos, this.#drawRadius(entity));
    }

    #drawRadius(entity : Entity) {
        const texture = entity.components.material?.texture ?? null;
        const left = -entity.geometry.width / 2 + (texture?.pos.x ?? 0);
        const top = -entity.geometry.height / 2 + (texture?.pos.y ?? 0);
        const right = left + (texture?.width ?? entity.geometry.width);
        const bottom = top + (texture?.height ?? entity.geometry.height);
        const farthestX = Math.max(Math.abs(left), Math.abs(right));
        const farthestY = Math.max(Math.abs(top), Math.abs(bottom));
        return Math.hypot(farthestX, farthestY) + SUBPIXEL_SNAP_MARGIN;
    }

    #drawEntity(entity : Entity) {
        const material = entity.getComponent('material');
        const texture = material.texture;

        this.#ctx.save();
        this.#ctx.globalAlpha = material.opacity;
        if (material.isAdditive) {
            this.#ctx.globalCompositeOperation = 'lighter';
        }
        this.#ctx.rotate(entity.pos.direction);

        const rx = Math.cos(-entity.pos.direction),
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
