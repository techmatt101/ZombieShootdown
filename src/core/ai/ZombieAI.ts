class ZombieAI implements IAI {
    private _zombie : Entity;
    private _player : Entity;


    constructor(entity : Entity, player : Entity) {
        this._zombie = entity;
        this._player = player;
    }

    update(dt : number) {
        this._zombie.pos.rotateDirection(this._player.pos);

        if(this._zombie.components.has(Movement)) {
            this._zombie.components.movement.direct(this._player.pos.clone().sub(this._zombie.pos), dt);  //TODO: optimize
        }
    }
}