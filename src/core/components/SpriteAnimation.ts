module ZombieApp {
    export class SpriteAnimator implements IComponent<ComponentList> {
        active = true;

        private _material : Material;
        private _animations : SpriteAnimation;
        //private _textures : Texture[];

        static reference(components : ComponentList) {
            return components.spriteAnimator;
        }

        constructor(material : Material) {
            this._material = material;

            this._animations = new SpriteAnimation({
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
            if (this._material.texture !== null) { //TODO: hack
                this._animations.update(dt, this._material.texture);
            }
        }

        drawDebug(ctx : CanvasRenderingContext2D) : void {
        }

        build(components : ComponentList) {
            components.spriteAnimator = this;
        }
    }
}