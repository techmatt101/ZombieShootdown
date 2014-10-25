class ZombieAI implements IAI {
    private _player : Entity;
    private _entity : Entity;


    constructor(entity : Entity, player : Entity) {
        this._entity = entity;
        this._player = player;
    }

    update(dt : number) {
        this._entity.pos.rotateDirection(this._player.pos);
        this._entity.pos.traject(this._entity.components.movement.speed * dt);
    }
}