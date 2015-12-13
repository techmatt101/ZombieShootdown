class Movement implements IComponent {
    active = true;
    speed : number;
    friction : number;
    direction  = new Vector(0, 0);

    private _pos : Point;

    static reference(components : IComponentDirectory) {
        return components.movement;
    }

    constructor(pos : Point, speed = 5, friction = 0) {
        this._pos = pos;
        this.speed = speed;
        this.friction = friction;
    }

    update(dt : number) : void {
        this.direction.normalize().scale(this.speed * dt);
        this._pos.add(this.direction);
        if (this.friction < 1) { //TODO: hmmm...
            this._pos.trajectFromDirection((this.speed - this.speed * this.friction) * dt);
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.movement = this;
    }
}