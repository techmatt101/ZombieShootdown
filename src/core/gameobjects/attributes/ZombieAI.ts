class ZombieAI2 implements IAttr {
    private _player : Entity;
    private _entity : Entity;


    constructor(player : Entity) {
        this._player = player;
    }

    create (entity : Entity) {
        this._entity = entity;
        this._entity.attr.controller = this;
    }

    update(dt : number) {
        this._entity.pos.rotateDirection(this._player.pos);
        this._entity.pos.traject(this._entity.attr.movement.speed * dt);
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}