class SpriteAnimation implements IComponent {
    active = true;

    private _entity : Entity;
    private _textures : Texture[];

    static reference(components : ComponentList) {
        return components.spriteAnimation;
    }

    constructor(entity : Entity) {
        this._entity = entity;
    }

    loadTextures(json, image : HTMLImageElement) {
        for (var i = 0; i < json.length; i++) {
            var data = json[i];
            this._textures.push(new Texture(image, data.width, data.height, new Vector(data.pos.x, data.pos.y)));
        }
    }


    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

    load(components : ComponentList) {
        components.spriteAnimation = this;
    }
}