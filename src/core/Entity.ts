class Entity implements IUpdate {
    id : string;
    pos : Vector;
    geometry : IShape;
    texture : Texture;
    components = new Components();


    constructor (id : string, geometry : IShape, texture : Texture) {
        this.id = id;
        this.geometry = geometry;
        this.texture = texture;
        this.pos = this.geometry.pos;

        if (geometry instanceof Box) { //TODO: temporary hack
            this.texture = new Texture(null, (<Box> geometry).width, (<Box> geometry).height, new Vector(0 ,0));
        }
    }

    update (dt : number) {
        this.components.update(dt);
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
        this.components.drawDebug(ctx);
    }
}
