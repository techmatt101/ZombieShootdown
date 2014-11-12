class Collision implements IComponent, IObserver {
    active = true;

    private _box : Box;
    private _isTouching = false;
    private _components : Components;
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

    canMove() {
        return this._components.hasActive(Movement);
    }

    setAsCollided() {
        this._isTouching = true;
        this._eventHandler.fire(CollisionEvents.COLLIDE);
    }

    test (collision : Collision) {
        if(this._box.isBoundingBoxWith(collision.getBoundary())) {
            this.setAsCollided();
            collision.setAsCollided();

            var offset = this._box.getOffset(collision.getBoundary());

            if(this.canMove() && collision.canMove()) {
                offset.scale(0.5);
            }

            if(this.canMove()) {
                this._box.pos.add(offset);
            }

            if(collision.canMove()) {
                collision.getBoundary().pos.sub(offset);
            }

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

    load(components : Components) {
        components.collision = this;
        this._components = components;
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