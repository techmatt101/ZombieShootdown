import type { ISpriteAnimationSequence } from './ISpriteAnimationSequence';
import type { Texture } from '../../lib/Texture';

export interface ISpriteAnimationData {
    animationTime : number;
    spriteSequence : ISpriteAnimationSequence[];
    playsOnce? : boolean;
}

const NOT_SHOWN = -1;

export class SpriteAnimation {
    #step = 0;
    #time = 0;
    #length = 0;
    #playsOnce : boolean;
    #sequence : ISpriteAnimationSequence[] = [];


    constructor(animation : ISpriteAnimationData) {
        this.#length = animation.animationTime;
        this.#sequence = animation.spriteSequence;
        this.#playsOnce = animation.playsOnce ?? false;
        if (this.#playsOnce) {
            this.#time = this.#length;
            this.#step = this.#sequence.length - 1;
        }
    }

    play() {
        this.#time = 0;
        this.#step = NOT_SHOWN;
    }

    update(dt : number, texture : Texture) {
        this.#time += dt;
        let step = Math.max(this.#step, 0);
        if (this.#time > this.#length) {
            if (this.#playsOnce) {
                this.#time = this.#length;
            } else {
                this.#time %= this.#length;
                step = 0;
            }
        }
        const lastStep = this.#sequence.length - 1;
        while (step < lastStep && this.#time > this.#sequence[step].time) {
            step++;
        }
        if (step !== this.#step) {
            this.#step = step;
            const frame = this.#sequence[step];
            texture.sourcePos.x = frame.x;
            texture.sourcePos.y = frame.y;
            texture.sourceWidth = frame.width;
            texture.sourceHeight = frame.height;
        }
    }
}
