class ZombieAI implements IEntityController {
    private _zombie : Zombie;
    private _player : Player;


    constructor(zombie : Zombie, player : Player) {
        this._zombie = zombie;
        this._player = player;
    }

    update(dt : number) {
        this._zombie.pos.rotateDirection(this._player.pos);
        this._zombie.pos.traject(this._zombie.speed * dt);
    }
}