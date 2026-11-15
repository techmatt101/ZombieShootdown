import type { ISpriteAnimationSequence } from './ISpriteAnimationSequence';

export interface ISpriteAnimationData {
    animationTime : number;
    spriteSequence : ISpriteAnimationSequence[];
}
import type { Texture } from '../../lib/Texture';

export class SpriteAnimation {
    #step = 0;
    #time = 0;
    #length = 0;
    #sequence : ISpriteAnimationSequence[] = [];


    constructor(animation : ISpriteAnimationData) {
        this.#length = animation.animationTime;
        this.#sequence = animation.spriteSequence;
    }

    update(dt : number, texture : Texture) {
        this.#time += dt;
        let step = this.#step;
        if (this.#time > this.#length) {
            this.#time %= this.#length;
            step = 0;
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
