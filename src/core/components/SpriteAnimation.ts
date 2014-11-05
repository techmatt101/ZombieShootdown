class SpriteAnimation implements IComponent {
    private _entity : Entity;
    private _textures : Texture[];


    constructor(entity : Entity) {
        this._entity = entity;
    }

    load(json, image : HTMLImageElement) {
        for (var i = 0; i < json.length; i++) {
            var data = json[i];
            this._textures.push(new Texture(image, data.width, data.height, new Vector(data.pos.x, data.pos.y)));
        }
    }

    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

}