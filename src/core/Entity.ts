class Entity implements IUpdate {
    id : string;
    pos : Vector;
    geometry : Box;
    texture : Texture = null;
    components = new Components();


    constructor (id : string, geometry : Box) {
        this.id = id;
        this.geometry = geometry;
        this.pos = this.geometry.pos;
    }

    setTexture (texture : Texture) {
        this.texture = texture;
    }

    update (dt : number) {
        this.components.update(dt);
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
        this.components.drawDebug(ctx);
    }
}
