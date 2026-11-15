import type { ISpriteAnimationSequence } from './ISpriteAnimationSequence';

export interface ISpriteAnimationData {
    animationTime : number;
    spriteSequence : ISpriteAnimationSequence[];
}
import { Texture } from '../../lib/Texture';

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

        if (this.#time > this.#length) {
            this.#time = 0;
            this.#step = 0;

            texture.sourcePos.x = this.#sequence[this.#step].x;
            texture.sourcePos.y = this.#sequence[this.#step].y;
            texture.sourceWidth = this.#sequence[this.#step].width;
            texture.sourceHeight = this.#sequence[this.#step].height;

        } else {
            if (this.#time > this.#sequence[this.#step].time) {
                while (this.#time > this.#sequence[this.#step].time) {
                    this.#step++;
                }
                texture.sourcePos.x = this.#sequence[this.#step].x;
                texture.sourcePos.y = this.#sequence[this.#step].y;
                texture.sourceWidth = this.#sequence[this.#step].width;
                texture.sourceHeight = this.#sequence[this.#step].height;
            }
        }

        //var lastKeyFrame = this._animations[this._step];
        //var nextKeyFrame = this._animations[this._step + 1];
        //
        //return {
        //    progress: (time - lastKeyFrame.time) / (nextKeyFrame.time - lastKeyFrame.time),  //TODO: calculate curve
        //    lastKeyFrame: lastKeyFrame,
        //    nextKeyFrame: nextKeyFrame
        //}
    }
}
