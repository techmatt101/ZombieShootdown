class Movement implements IAttr{
    private _entity : Entity;
    speed : number;


    constructor(speed = 5) {
        this.speed = speed;
    }

    create (entity : Entity) {
        this._entity = entity;
        this._entity.attr.movement = this;
    }

    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

    direct (direction : Vector, dt : number) {
        direction.normalize();
        direction.scale(this.speed * dt);
        this._entity.pos.add(direction);
    }

    traject (dt : number) {
        this._entity.pos.traject(this.speed * dt);
    }
}