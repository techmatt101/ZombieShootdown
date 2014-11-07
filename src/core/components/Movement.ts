class Movement implements IComponent {
    speed : number;
    friction : number;

    private _pos : Vector;


    constructor(pos : Vector, speed = 5, friction = 0) {
        this._pos = pos;
        this.speed = speed;
        this.friction = friction;
    }

    update (dt : number) : void {
        if(this.friction < 1) { //TODO: hmmm...
            this._pos.traject((this.speed - this.speed * this.friction) * dt);
        }
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

    direct (direction : Vector, dt : number) {
        direction.normalize().scale(this.speed * dt);
        this._pos.add(direction);
    }

    traject (dt : number) {
        this._pos.traject(this.speed * dt);
    }
}