enum CollisionEvent {
    COLLIDE
}

class Collision implements IComponent, IObserver {
    active = true;
    behaviours = new CollisionBehaviourList();

    private _box : Box;
    private _isTouching = false;
    private _eventHandler = new EventHandler<CollisionEvent>();
    private _behaviourList : Array<(behaviours) => IBehavior> = [];

    static reference(components : IComponentDirectory) {
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
        this._eventHandler.fire(CollisionEvent.COLLIDE);
    }

    test(collision : Collision) {
        return this._box.isBoundingBoxWith(collision.getBoundary());
    }

    testBehaviours(collision : Collision) {
        for (var i = 0; i < this._behaviourList.length; i++) {
            var our = this._behaviourList[i](this.behaviours),
                their = this._behaviourList[i](collision.behaviours);

            if (typeof their !== 'undefined') {
                if (our.dominant && their.passive) {
                    our.action(their);
                }
                if (their.dominant && our.passive) {
                    their.action(our);
                }
            }
        }
    }

    buildBehaviours() {
        this._behaviourList = [];
        for (var key in this.behaviours) {
            this._behaviourList.push(<(behaviours : any) => IBehavior> new Function('b', 'return b.' + key + ';'));
        }
    }

    update(dt : number) : void {
        this._isTouching = false;
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
        ctx.strokeStyle = (this._isTouching) ? '#FFFF00' : '#F00';
        ctx.strokeRect(this._box.pos.x - this._box.width / 2, this._box.pos.y - this._box.height / 2, this._box.width, this._box.height);
    }

    build(components : IComponentDirectory) {
        components.collision = this;
        this.buildBehaviours();
    }

    on(event_type : CollisionEvent, callback) {
        this._eventHandler.add(event_type, callback);
    }

    off() {
    }
}