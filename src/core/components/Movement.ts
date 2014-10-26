class Movement implements IComponent {
    speed : number;

    private _pos : Vector;


    constructor(pos : Vector, speed = 5) {
        this._pos = pos;
        this.speed = speed;
    }

    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

    direct (direction : Vector, dt : number) {
        direction.normalize();
        direction.scale(this.speed * dt);
        this._pos.add(direction);
    }

    traject (dt : number) {
        this._pos.traject(this.speed * dt);
    }
}