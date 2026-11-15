import type { IFilter } from './IFilter';
import type { SightMask } from '../CanvasRenderer';
import { computeVisibilityPolygon } from '../../../lighting/visibility';
import { loadImage } from '../../../lib/assets';
import type { Camera } from '../../../lib/Camera';
import type { Canvas } from '../../../lib/Canvas';
import type { IUpdate } from '../../../lib/IUpdate';
import type { TileMap } from '../../../world/TileMap';
import type { Light } from '../../components/Light';
import type { LightReceiver } from '../../systems/LightingSystem';

const MIN_LIGHT_MOVEMENT = 0.5;
const REMEMBERED_BRIGHTNESS = 0.3;
const WARM_GLOW_CORE = 'rgba(255, 190, 90, 1)';
const WARM_GLOW_EDGE = 'rgba(255, 120, 30, 0)';

export interface RememberedMap {
    reveal(polygon : Float32Array) : void;
    draw(ctx : CanvasRenderingContext2D, camera : Camera) : void;
}

interface LitArea {
    x : number;
    y : number;
    radius : number;
    tileMapVersion : number;
    polygon : Float32Array;
}

export class LightFilter implements IUpdate, IFilter, LightReceiver, SightMask {
    #tileMap : TileMap;
    #memory : RememberedMap | null;
    #lights : readonly Light[] = [];
    #litAreas = new Map<Light, LitArea>();
    #visionImage : HTMLImageElement | null = null;

    constructor(tileMap : TileMap, memory : RememberedMap | null = null) {
        this.#tileMap = tileMap;
        this.#memory = memory;
        loadImage('vision').then((img) => {
            this.#visionImage = img;
        });
    }

    setLights(lights : readonly Light[]) {
        this.#lights = lights;
    }

    update(dt : number) {
        const lights = this.#lights;
        for (let i = 0; i < lights.length; i++) {
            this.#refreshLitArea(lights[i]);
        }
    }

    init(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.globalCompositeOperation = 'lighter';
        if (this.#memory !== null) {
            ctx.globalAlpha = REMEMBERED_BRIGHTNESS;
            this.#memory.draw(ctx, camera);
        }
        const vision = this.#visionImage;
        if (vision !== null) {
            const lights = this.#lights;
            for (let i = 0; i < lights.length; i++) {
                this.#drawBrightness(ctx, lights[i], vision);
            }
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-atop';
    }

    close(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.globalCompositeOperation = 'lighter';
        const lights = this.#lights;
        for (let i = 0; i < lights.length; i++) {
            if (lights[i].glow > 0) {
                this.#drawGlow(ctx, lights[i]);
            }
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    clipToSight(ctx : CanvasRenderingContext2D) {
        ctx.beginPath();
        const lights = this.#lights;
        for (let i = 0; i < lights.length; i++) {
            if (lights[i].isSight) {
                this.#traceLitArea(ctx, lights[i]);
            }
        }
        ctx.clip();
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }

    #refreshLitArea(light : Light) {
        const { x, y } = light.pos;
        const cached = this.#litAreas.get(light);
        const isCurrent = cached !== undefined
            && cached.radius === light.radius
            && cached.tileMapVersion === this.#tileMap.version
            && Math.hypot(x - cached.x, y - cached.y) <= MIN_LIGHT_MOVEMENT;
        if (isCurrent) return;
        const polygon = computeVisibilityPolygon(this.#tileMap, x, y, light.radius);
        this.#litAreas.set(light, { x, y, radius: light.radius, tileMapVersion: this.#tileMap.version, polygon });
        if (light.isSight) {
            this.#memory?.reveal(polygon);
        }
    }

    #drawBrightness(ctx : CanvasRenderingContext2D, light : Light, vision : HTMLImageElement) {
        const { x, y } = light.pos;
        const size = light.radius * 2;
        ctx.save();
        this.#clipToLitArea(ctx, light);
        ctx.globalAlpha = light.intensity;
        ctx.drawImage(vision, x - light.radius, y - light.radius, size, size);
        ctx.restore();
    }

    #drawGlow(ctx : CanvasRenderingContext2D, light : Light) {
        const { x, y } = light.pos;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, light.radius);
        glow.addColorStop(0, WARM_GLOW_CORE);
        glow.addColorStop(1, WARM_GLOW_EDGE);
        ctx.save();
        this.#clipToLitArea(ctx, light);
        ctx.globalAlpha = light.intensity * light.glow;
        ctx.fillStyle = glow;
        ctx.fillRect(x - light.radius, y - light.radius, light.radius * 2, light.radius * 2);
        ctx.restore();
    }

    #clipToLitArea(ctx : CanvasRenderingContext2D, light : Light) {
        ctx.beginPath();
        this.#traceLitArea(ctx, light);
        ctx.clip();
    }

    #traceLitArea(ctx : CanvasRenderingContext2D, light : Light) {
        const polygon = this.#litAreas.get(light)?.polygon;
        if (polygon === undefined || polygon.length < 6) return;
        ctx.moveTo(polygon[0], polygon[1]);
        for (let i = 2; i < polygon.length; i += 2) {
            ctx.lineTo(polygon[i], polygon[i + 1]);
        }
        ctx.closePath();
    }
}
