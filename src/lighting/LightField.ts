import type { RememberedChunk } from './MapMemory';
import { computeVisibilityPolygon } from './visibility';
import type { Light } from '../core/components/Light';
import type { LightReceiver } from '../core/systems/LightingSystem';
import type { Camera } from '../lib/Camera';
import type { IUpdate } from '../lib/IUpdate';
import type { TileMap } from '../world/TileMap';

const MIN_LIGHT_MOVEMENT = 0.5;
const SIGHT_DEBUG_COLOUR = '#0ff';
const LIGHT_DEBUG_COLOUR = '#fa0';
const RAY_DEBUG_ALPHA = 0.2;
const POINT_DEBUG_SIZE = 4;

export interface RememberedMap {
    reveal(polygon : Float32Array) : void;
    rememberedInView(camera : Camera, out : RememberedChunk[]) : void;
}

export interface LitArea {
    x : number;
    y : number;
    radius : number;
    tileMapVersion : number;
    polygon : Float32Array;
}

export class LightField implements IUpdate, LightReceiver {
    #tileMap : TileMap;
    #memory : RememberedMap | null;
    #lights : readonly Light[] = [];
    #litAreas = new Map<Light, LitArea>();
    #version = 0;

    constructor(tileMap : TileMap, memory : RememberedMap | null = null) {
        this.#tileMap = tileMap;
        this.#memory = memory;
    }

    get lights() {
        return this.#lights;
    }

    get version() {
        return this.#version;
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

    litAreaOf(light : Light) {
        return this.#litAreas.get(light);
    }

    rememberedInView(camera : Camera, out : RememberedChunk[]) {
        if (this.#memory === null) {
            out.length = 0;
            return;
        }
        this.#memory.rememberedInView(camera, out);
    }

    get pointCount() {
        let points = 0;
        const lights = this.#lights;
        for (let i = 0; i < lights.length; i++) {
            points += (this.#litAreas.get(lights[i])?.polygon.length ?? 0) / 2;
        }
        return points;
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        const lights = this.#lights;
        for (let i = 0; i < lights.length; i++) {
            const area = this.#litAreas.get(lights[i]);
            if (area !== undefined) {
                drawLitAreaDebug(ctx, area, lights[i].isSight ? SIGHT_DEBUG_COLOUR : LIGHT_DEBUG_COLOUR);
            }
        }
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
        this.#version++;
        if (light.isSight) {
            this.#memory?.reveal(polygon);
        }
    }
}

function drawLitAreaDebug(ctx : CanvasRenderingContext2D, area : LitArea, colour : string) {
    const polygon = area.polygon;
    if (polygon.length < 2) return;
    ctx.save();
    ctx.strokeStyle = colour;
    ctx.fillStyle = colour;

    ctx.globalAlpha = RAY_DEBUG_ALPHA;
    ctx.beginPath();
    for (let i = 0; i < polygon.length; i += 2) {
        ctx.moveTo(area.x, area.y);
        ctx.lineTo(polygon[i], polygon[i + 1]);
    }
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(polygon[0], polygon[1]);
    for (let i = 2; i < polygon.length; i += 2) {
        ctx.lineTo(polygon[i], polygon[i + 1]);
    }
    ctx.closePath();
    ctx.stroke();

    const halfPoint = POINT_DEBUG_SIZE / 2;
    for (let i = 0; i < polygon.length; i += 2) {
        ctx.fillRect(polygon[i] - halfPoint, polygon[i + 1] - halfPoint, POINT_DEBUG_SIZE, POINT_DEBUG_SIZE);
    }
    ctx.restore();
}
