class Entity implements IUpdate, IPool {
    id : string;
    pos : Vector;
    geometry : Box;
    components : Components;
    available = false;
    active = true;


    constructor (id : string, geometry : Box) {
        this.id = id;
        this.geometry = geometry;
        this.pos = this.geometry.pos; //TODO: hmmmm...
        this.components = new Components(this);
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
