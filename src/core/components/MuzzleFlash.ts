import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { Light } from './Light';
import type { Material } from './Material';
import type { Point } from '../../lib/geometry/Point';

export const FLASH_DURATION = 0.6;
export const FLASH_LIGHT_DURATION = 1.2;
const MAX_TILT = 0.35;

export class MuzzleFlash implements IComponent {
    active = true;

    #pos : Point;
    #material : Material;
    #light : Light | null;
    #muzzle : Point;
    #reach : number;
    #random : () => number;
    #sinceFired = Infinity;
    #tilt = 0;

    static reference(components : IComponentDirectory) {
        return components.muzzleFlash;
    }

    constructor(pos : Point, material : Material, muzzle : Point, reach : number, light : Light | null = null, random = Math.random) {
        this.#pos = pos;
        this.#material = material;
        this.#light = light;
        this.#muzzle = muzzle;
        this.#reach = reach;
        this.#random = random;
    }

    get isShowing() {
        return this.#sinceFired < FLASH_DURATION;
    }

    trigger() {
        this.#sinceFired = 0;
        this.#tilt = (this.#random() * 2 - 1) * MAX_TILT;
        this.#material.active = true;
        this.#followMuzzle();
        this.#updateLight();
    }

    update(dt : number) {
        if (this.#sinceFired >= FLASH_LIGHT_DURATION) return;
        this.#sinceFired += dt;
        if (this.isShowing) {
            this.#followMuzzle();
        } else {
            this.#material.active = false;
        }
        this.#updateLight();
    }

    reset() {
        this.#sinceFired = Infinity;
        this.#material.active = false;
        this.#updateLight();
    }

    #updateLight() {
        if (this.#light === null) return;
        const fade = Math.max(0, 1 - this.#sinceFired / FLASH_LIGHT_DURATION);
        this.#light.intensity = fade * fade;
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.muzzleFlash = this;
    }

    #followMuzzle() {
        const facing = this.#muzzle.direction;
        this.#pos.x = this.#muzzle.x + Math.cos(facing) * this.#reach;
        this.#pos.y = this.#muzzle.y + Math.sin(facing) * this.#reach;
        this.#pos.direction = facing + this.#tilt;
    }
}
