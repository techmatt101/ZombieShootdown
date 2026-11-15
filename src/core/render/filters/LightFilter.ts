import type { IFilter } from './IFilter';
import { computeVisibilityPolygon } from '../../../lighting/visibility';
import { loadImage } from '../../../lib/assets';
import type { Camera } from '../../../lib/Camera';
import type { Canvas } from '../../../lib/Canvas';
import { Vector } from '../../../lib/geometry/Vector';
import type { IUpdate } from '../../../lib/IUpdate';
import type { TileMap } from '../../../world/TileMap';

const VISION_RADIUS = 900;
const MIN_LIGHT_MOVEMENT = 0.5;

export class LightFilter implements IUpdate, IFilter {
    #tileMap : TileMap;
    #lightSource = new Vector(0, 0);
    #polygon : Float32Array = new Float32Array();
    #litFrom = { x: Number.NaN, y: Number.NaN, tileMapVersion: -1 };
    #visionImage : HTMLImageElement | null = null;

    constructor(tileMap : TileMap) {
        this.#tileMap = tileMap;
        loadImage('vision').then((img) => {
            this.#visionImage = img;
        });
    }

    setLightSource(lightSource : Vector) {
        this.#lightSource = lightSource;
    }

    update(dt : number) {
        const { x, y } = this.#lightSource;
        const lightMoved = Math.hypot(x - this.#litFrom.x, y - this.#litFrom.y) > MIN_LIGHT_MOVEMENT || Number.isNaN(this.#litFrom.x);
        const tilesChanged = this.#tileMap.version !== this.#litFrom.tileMapVersion;
        if (lightMoved || tilesChanged) {
            this.#polygon = computeVisibilityPolygon(this.#tileMap, x, y, VISION_RADIUS);
            this.#litFrom = { x, y, tileMapVersion: this.#tileMap.version };
        }
    }

    init(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        const view = camera.view;
        ctx.fillRect(view.left, view.top, view.right - view.left, view.bottom - view.top);
        this.#drawLitArea(ctx);
        ctx.globalCompositeOperation = 'source-atop';
    }

    close(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.globalCompositeOperation = 'source-over';
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }

    #drawLitArea(ctx : CanvasRenderingContext2D) {
        const polygon = this.#polygon;
        if (polygon.length >= 6) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(polygon[0], polygon[1]);
            for (let i = 2; i < polygon.length; i += 2) {
                ctx.lineTo(polygon[i], polygon[i + 1]);
            }
            ctx.fill();
        }

        if (this.#visionImage === null) return;
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(
            this.#visionImage,
            this.#lightSource.x - VISION_RADIUS, this.#lightSource.y - VISION_RADIUS,
            VISION_RADIUS * 2, VISION_RADIUS * 2
        );
    }
}
