import { SpriteAnimation, type ISpriteAnimationData } from '../animation/SpriteAnimation';
import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { Material } from './Material';

export class SpriteAnimator implements IComponent {
    active = true;

    #material : Material;
    #animations : SpriteAnimation;

    static reference(components : IComponentDirectory) {
        return components.spriteAnimator;
    }

    constructor(material : Material, animation : ISpriteAnimationData) {
        this.#material = material;
        this.#animations = new SpriteAnimation(animation);
    }

    play() {
        this.#animations.play();
    }


    update(dt : number) : void {
        if (this.#material.texture !== null) {
            this.#animations.update(dt, this.#material.texture);
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.spriteAnimator = this;
    }
}
