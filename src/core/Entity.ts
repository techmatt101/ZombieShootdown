class Entity implements IUpdate, IPool {
    id : string;
    pos : Vector;
    geometry : Box;
    texture : Texture = null;
    components : Components;
    available = false;
    active = true;
    behaviors = [];


    constructor (id : string, geometry : Box) {
        this.id = id;
        this.geometry = geometry;
        this.pos = this.geometry.pos;
        this.components = new Components(this);
    }

    setTexture (texture : Texture) {
        this.texture = texture;
    }

    reset () { ///TODO: hmmm...
        this.active = true;
    }

    update (dt : number) {
        if (this.active) {
            this.components.update(dt);
        }
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
        if (this.active) {
            this.components.drawDebug(ctx);
        }
    }
}
