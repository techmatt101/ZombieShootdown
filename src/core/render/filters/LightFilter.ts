import { MapManager } from '../../level/MapManager';
import type { IFilter } from './IFilter';
import { Camera } from '../../../lib/Camera';
import { Canvas } from '../../../lib/Canvas';
import { Vector } from '../../../lib/geometry/Vector';
import type { IUpdate } from '../../../lib/IUpdate';
import { loadImage } from '../../../lib/assets';

import type { IVector } from '../../../lib/geometry/IVector';

export type LightPolygon = IVector[];

const VISION_RADIUS = 900;

export class LightFilter implements IUpdate, IFilter {
    #map : MapManager;
    #lightSource = new Vector(0, 0);
    #polygons : LightPolygon[] = [];

    #worker = new Worker(new URL("../../../workers/lighting.ts", import.meta.url), { type: "module" });
    #workerWorking = false;

    #visionImage : HTMLImageElement | null = null;

    constructor(map : MapManager) {
        this.#map = map;

        this.#worker.onmessage = (e : MessageEvent<LightPolygon[]>) => {
            this.#workerWorking = false;
            this.#polygons = e.data;
        };

        loadImage('vision').then((img) => {
            this.#visionImage = img;
        });
    }

    setLightSource(lightSource : Vector) {
        this.#lightSource = lightSource;
    }

    init(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(camera.pos.x - camera.viewportOffset.x, camera.pos.y - camera.viewportOffset.y, canvas.width, canvas.height);
        this.draw(ctx);

        ctx.globalCompositeOperation = 'source-atop';
    }

    close(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.globalCompositeOperation = 'source-over';
    }

    update(dt : number) {
        if (!this.#workerWorking) {
            this.#worker.postMessage({
                x: this.#lightSource.x,
                y: this.#lightSource.y,
                s: this.#map.segments
            });
            this.#workerWorking = true;
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }

    draw(ctx : CanvasRenderingContext2D) {
        for (let i = 1; i < this.#polygons.length; i++) {
            this.#drawPolygon(this.#polygons[i], ctx, "rgba(0,0,0,0.2)");
        }
        if (this.#polygons.length > 0) {
            this.#drawPolygon(this.#polygons[0], ctx, "#000");
        }

        if (this.#visionImage === null) return;
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(
            this.#visionImage,
            this.#lightSource.x - VISION_RADIUS, this.#lightSource.y - VISION_RADIUS,
            VISION_RADIUS * 2, VISION_RADIUS * 2
        );
    }

    #drawPolygon(polygon : LightPolygon, ctx : CanvasRenderingContext2D, fillStyle : string) {
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo(polygon[0].x, polygon[0].y);
        for (let i = 1; i < polygon.length; i++) {
            const intersect = polygon[i];
            ctx.lineTo(intersect.x, intersect.y);
        }
        ctx.fill();
    }
}
