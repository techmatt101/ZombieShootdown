class PlayerController implements IEntityController {
    private _player : Player;
    private _input : InputController;
    private _camera : Camera;


    constructor(player : Player, input : InputController, camera : Camera) {
        this._player = player;
        this._input = input;
        this._camera = camera;
    }

    update(dt : number) {
        this._player.pos.rotateDirection(this._camera.view.clone().reverse().offset(this._input.getPointerPos())); //TODO: optimize

        var movement = new Vector(0,0);

        if(this._input.isDown(InputAction.LEFT)) movement.x -= 1;
        if(this._input.isDown(InputAction.RIGHT)) movement.x += 1;
        if(this._input.isDown(InputAction.UP)) movement.y -= 1;
        if(this._input.isDown(InputAction.DOWN)) movement.y += 1;

        movement.normalize();

        movement.x *= this._player.speed * dt;
        movement.y *= this._player.speed * dt;

        this._player.pos.x += movement.x;
        this._player.pos.y += movement.y;

        if(this._input.isDown(InputAction.ACTION_1)) {
            this._player.weapon.attack();
        }
    }
}