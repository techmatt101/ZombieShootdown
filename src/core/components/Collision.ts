class Collision implements IComponent, IObserver {
    active = true;

    private _box : Box;
    private _isTouching = false;
    private _eventHandler = new EventHandler<CollisionEvents>();


    static reference(components : Components) {
        return components.collision;
    }

    constructor(box : Box) {
        this._box = box;
    }

    getBoundary() {
        return this._box;
    }

    setAsCollided() {
        this._isTouching = true;
        this._eventHandler.fire(CollisionEvents.COLLIDE);
    }

    test (collision : Collision) {
        return this._box.isBoundingBoxWith(collision.getBoundary());
    }


    update (dt : number) : void {
        this._isTouching = false;
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
        ctx.strokeStyle = (this._isTouching) ? '#FFFF00' : '#F00';
        ctx.strokeRect(this._box.pos.x - this._box.width / 2, this._box.pos.y - this._box.height / 2, this._box.width, this._box.height);
    }

    load(components : Components) {
        components.collision = this;
    }

    on (event_type : CollisionEvents, callback) {
        this._eventHandler.add(event_type, callback);
    }

    off () {
    }
}

enum CollisionEvents {
    COLLIDE
}