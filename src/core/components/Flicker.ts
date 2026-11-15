import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { Light } from './Light';

const STEADY = 0.9;
const HUM = 0.06;
const HUM_SPEED = 2.3;
const FLUTTER = 0.04;
const FLUTTER_SPEED = 11.7;
const DROPOUT_SPEED = 0.11;
const DROPOUT_THRESHOLD = 0.995;
const DROPOUT_DIM = 0.35;
const STUTTER_SPEED = 40;
const SEED_PHASE_SPREAD = 7;

export function flickerAt(time : number, seed : number) {
    const isDroppingOut = Math.sin(time * DROPOUT_SPEED + seed * SEED_PHASE_SPREAD) > DROPOUT_THRESHOLD;
    if (isDroppingOut) {
        return DROPOUT_DIM + DROPOUT_DIM * Math.abs(Math.sin(time * STUTTER_SPEED));
    }
    return STEADY + HUM * Math.sin(time * HUM_SPEED + seed) + FLUTTER * Math.sin(time * FLUTTER_SPEED + seed * 3);
}

export class Flicker implements IComponent {
    active = true;

    #light : Light;
    #brightness : number;
    #seed : number;
    #time = 0;

    static reference(components : IComponentDirectory) {
        return components.flicker;
    }

    constructor(light : Light, brightness : number, seed = 0) {
        this.#light = light;
        this.#brightness = brightness;
        this.#seed = seed;
        this.#show();
    }

    update(dt : number) {
        this.#time += dt;
        this.#show();
    }

    reset() {
        this.#time = 0;
        this.#show();
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.flicker = this;
    }

    #show() {
        this.#light.intensity = this.#brightness * flickerAt(this.#time, this.#seed);
    }
}
