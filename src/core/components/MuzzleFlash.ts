import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { Light } from './Light';
import type { Material } from './Material';
import type { Point } from '../../lib/geometry/Point';

export const FLASH_LIGHT_DURATION = 1.2;

export interface FlashGlow {
    pos : Point;
    material : Material;
    muzzle : Point;
    reach : number;
}

export class MuzzleFlash implements IComponent {
    active = true;

    #light : Light;
    #glow : FlashGlow;
    #sinceFired = Infinity;

    static reference(components : IComponentDirectory) {
        return components.muzzleFlash;
    }

    constructor(light : Light, glow : FlashGlow) {
        this.#light = light;
        this.#glow = glow;
    }

    get isFlashing() {
        return this.#sinceFired < FLASH_LIGHT_DURATION;
    }

    trigger() {
        this.#sinceFired = 0;
        this.#show();
    }

    update(dt : number) {
        if (!this.isFlashing) return;
        this.#sinceFired += dt;
        this.#show();
    }

    reset() {
        this.#sinceFired = Infinity;
        this.#show();
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.muzzleFlash = this;
    }

    #show() {
        const fade = Math.max(0, 1 - this.#sinceFired / FLASH_LIGHT_DURATION);
        const intensity = fade * fade;
        this.#light.intensity = intensity;
        const glow = this.#glow;
        glow.material.active = intensity > 0;
        glow.material.opacity = intensity;
        if (intensity > 0) {
            this.#placeAtMuzzle(glow);
        }
    }

    #placeAtMuzzle(glow : FlashGlow) {
        const facing = glow.muzzle.direction;
        glow.pos.x = glow.muzzle.x + Math.cos(facing) * glow.reach;
        glow.pos.y = glow.muzzle.y + Math.sin(facing) * glow.reach;
    }
}
