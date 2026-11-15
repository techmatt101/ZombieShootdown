import { SpriteAnimation } from '../animation/SpriteAnimation';
import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { Material } from './Material';

export class SpriteAnimator implements IComponent {
    active = true;

    #material : Material;
    #animations : SpriteAnimation;
    //private _textures : Texture[];

    static reference(components : IComponentDirectory) {
        return components.spriteAnimator;
    }

    constructor(material : Material) {
        this.#material = material;

        this.#animations = new SpriteAnimation({
            "animationTime": 4,
            "spriteSequence": [
                {
                    "x": 0, "y": 0,
                    "width": 28, "height": 20,
                    "time": 2
                },
                {
                    "x": 0, "y": 20,
                    "width": 28, "height": 20,
                    "time": 4
                }
            ]
        });
    }

    //loadTextures(json, image : HTMLImageElement) {
    //    for (var i = 0; i < json.spriteSequence.length; i++) {
    //        var data = json.spriteSequence[i];
    //        this._textures.push(new Texture(image, data.width, data.height, new Vector(data.x, data.y)));
    //    }
    //}

    update(dt : number) : void {
        if (this.#material.texture !== null) { //TODO: hack
            this.#animations.update(dt, this.#material.texture);
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.spriteAnimator = this;
    }
}
