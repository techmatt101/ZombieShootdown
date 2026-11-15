import { MapManager } from '../../level/MapManager';
import type { IFilter } from './IFilter';
import { Camera } from '../../../lib/Camera';
import { Canvas } from '../../../lib/Canvas';
import { Vector } from '../../../lib/geometry/Vector';
import type { IUpdate } from '../../../lib/IUpdate';
import { ResourceManager } from '../../../lib/ResourceManager';

import type { IVector } from '../../../lib/geometry/IVector';

/** Visible-area outline computed by the lighting worker. */
export type LightPolygon = IVector[];

export class LightFilter implements IUpdate, IFilter {
    #map : MapManager;
    #lightSource = new Vector(0, 0);
    #polygons : LightPolygon[] = [];

    #worker = new Worker(new URL("../../../workers/lighting.ts", import.meta.url), { type: "module" });
    #workerWorking = false;

    #visionImage : HTMLImageElement | null = null;

    constructor(map : MapManager) { //TODO: hmmm.. just only segments will do?
        this.#map = map;

        this.#worker.onmessage = (e : MessageEvent<LightPolygon[]>) => {
            this.#workerWorking = false;
            this.#polygons = e.data;
        };

        ResourceManager.retrieveImage('vision', (img : HTMLImageElement) => {
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
        for (var i = 1; i < this.#polygons.length; i++) {
            this.#drawPolygon(this.#polygons[i], ctx, "rgba(0,0,0,0.2)");
        }
        if (this.#polygons.length > 0) { //TODO: hmmm...
            this.#drawPolygon(this.#polygons[0], ctx, "#000");
        }

        if (this.#visionImage === null) return;
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(this.#visionImage, this.#lightSource.x - 900, this.#lightSource.y - 900, 1800, 1800); //TODO: better scale vision
    }

    #drawPolygon(polygon : LightPolygon, ctx : CanvasRenderingContext2D, fillStyle : string) { //TODO: hmmm....
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo(polygon[0].x, polygon[0].y);
        for (var i = 1; i < polygon.length; i++) {
            var intersect = polygon[i];
            ctx.lineTo(intersect.x, intersect.y);
        }
        ctx.fill();
    }
}
