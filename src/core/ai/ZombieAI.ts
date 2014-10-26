class ZombieAI implements IAI {
    private _player : Entity;
    private _entity : Entity;


    constructor(entity : Entity, player : Entity) {
        this._entity = entity;
        this._player = player;
    }

    update(dt : number) {
        this._entity.pos.rotateDirection(this._player.pos);

        if(this._entity.components.has(Movement)) {
            var movement = <Movement> this._entity.components.get(Movement);
            this._entity.pos.traject(movement.speed * dt);
        }
    }
}