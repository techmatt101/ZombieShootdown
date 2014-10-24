class Entity implements IUpdate {
    id : string;
    pos : Vector;
    geometry : IShape;
    texture : Texture;
    attr = new Attributes();

    private _attrs : IAttr[] = [];


    constructor (id : string, geometry : IShape, texture : Texture) {
        this.id = id;
        this.geometry = geometry;
        this.texture = texture;
        this.pos = this.geometry.pos;

        if (geometry instanceof Box) { //TODO: temporary hack
            this.texture = new Texture();
            this.texture.width = (<Box> geometry).width;
            this.texture.height = (<Box> geometry).height;
        }
    }

    addAttr (attr : IAttr) {
        this._attrs.push(attr);
        attr.create(this);
    }

    update (dt : number) {
        for (var i = 0; i < this._attrs.length; i++) {
            this._attrs[i].update(dt);
        }
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
        for (var i = 0; i < this._attrs.length; i++) {
            this._attrs[i].drawDebug(ctx);
        }
    }
}
