/// <reference path="../../Entity.ts" />

class Zombie extends Entity {
    private _player : Player;
    private _speed = 5;


    constructor(position, width, height, img, player) {
        super(position, width, height, img);
        this._player = player;
    }

    update(dt : number) {
        this.pos.rotateDirection(this._player.pos);
        this.pos.traject(this._speed * dt);
    }
}