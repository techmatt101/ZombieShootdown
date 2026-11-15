import type { RememberedChunk } from './MapMemory';
import { computeVisibilityPolygon } from './visibility';
import type { Light } from '../core/components/Light';
import type { LightReceiver } from '../core/systems/LightingSystem';
import type { Camera } from '../lib/Camera';
import type { IUpdate } from '../lib/IUpdate';
import type { TileMap } from '../world/TileMap';

const MIN_LIGHT_MOVEMENT = 0.5;

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
        this.#version++;
        if (light.isSight) {
            this.#memory?.reveal(polygon);
        }
    }
}
