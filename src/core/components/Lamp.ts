import { flickerAt } from './Flicker';
import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { Light, LightColour } from './Light';
import type { Material } from './Material';
import type { Texture } from '../../lib/Texture';

export const SPUTTER_DURATION = 6;
const SPUTTER_SPEED = 9;
const SPUTTER_ON = 0.5;
const SPUTTER_DIM = 0.2;

export interface LampLook {
    lit : Texture;
    broken : Texture;
}

export function brokenLampSputter(sinceBroken : number, time : number, seed : number) {
    const remaining = Math.max(0, 1 - sinceBroken / SPUTTER_DURATION);
    const spark = Math.abs(Math.sin(time * SPUTTER_SPEED + seed)) > SPUTTER_ON ? 1 : SPUTTER_DIM;
    return remaining * remaining * spark;
}

export class Lamp implements IComponent {
    active = true;
    isBroken = false;

    #light : Light;
    #material : Material;
    #look : LampLook | null = null;
    #seed = 0;
    #time = 0;
    #sinceBroken = 0;

    static reference(components : IComponentDirectory) {
        return components.lamp;
    }

    constructor(light : Light, material : Material) {
        this.#light = light;
        this.#material = material;
    }

    switchOn(look : LampLook, colour : LightColour, seed : number, isBroken : boolean) {
        this.#look = look;
        this.#seed = seed;
        this.#light.colour = colour;
        this.#light.glowColour = colour;
        this.isBroken = isBroken;
        this.#sinceBroken = isBroken ? SPUTTER_DURATION : 0;
        this.#material.setTexture(isBroken ? look.broken : look.lit);
        this.#show();
    }

    break() {
        if (this.isBroken) return;
        this.isBroken = true;
        this.#sinceBroken = 0;
        if (this.#look !== null) {
            this.#material.setTexture(this.#look.broken);
        }
        this.#show();
    }

    update(dt : number) {
        this.#time += dt;
        if (this.isBroken) {
            this.#sinceBroken += dt;
        }
        this.#show();
    }

    reset() {
        this.isBroken = false;
        this.#time = 0;
        this.#sinceBroken = 0;
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.lamp = this;
    }

    #show() {
        this.#light.intensity = this.isBroken
            ? brokenLampSputter(this.#sinceBroken, this.#time, this.#seed)
            : flickerAt(this.#time, this.#seed);
    }
}
