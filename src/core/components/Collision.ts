class Collision implements IComponent, IObserver {
    private _box : Box;
    private _isTouching = false;
    private _eventHandler = new EventHandler<CollisionEvents>();


    constructor(box : Box) {
        this._box = box;
    }

    on (event_type : CollisionEvents, callback) {
        this._eventHandler.add(event_type, callback);
    }

    setAsCollided() {
        this._isTouching = true;
        this._eventHandler.fire(CollisionEvents.COLLIDE);
    }

    off () {
    }

    getBoundary() {
        return this._box;
    }

    test (collision : Collision) {
        if(this._box.isBoundingBoxWith(collision.getBoundary())) {
            this.setAsCollided();
            collision.setAsCollided();
            this._box.pos.add(this._box.getOffset(collision.getBoundary()));

            return true;
        }
        return false;
    }

    update (dt : number) : void {
        this._isTouching = false;
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
        ctx.strokeStyle = (this._isTouching) ? '#FFFF00' : '#F00';
        ctx.strokeRect(this._box.pos.x - this._box.width / 2, this._box.pos.y - this._box.height / 2, this._box.width, this._box.height);
    }
}

enum CollisionEvents {
    COLLIDE
}