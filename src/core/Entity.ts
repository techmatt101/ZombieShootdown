class Entity implements IUpdate, IPool {
    id : string;
    pos : Vector;
    geometry : Box;
    texture : Texture = null;
    components = new Components();
    available = false;
    active = true;
    behaviors = [];


    constructor (id : string, geometry : Box) {
        this.id = id;
        this.geometry = geometry;
        this.pos = this.geometry.pos;
    }

    setTexture (texture : Texture) {
        this.texture = texture;
    }

    reset () { ///TODO: hmmm...
        this.active = true;
    }

    update (dt : number) {
        this.components.update(dt);
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
        this.components.drawDebug(ctx);
    }
}
