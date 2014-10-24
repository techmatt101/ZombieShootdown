class InputControl implements IAttr {
    private _entity : Entity;
    private _input : InputController;
    private _camera : Camera;
    private _movement = new Vector();


    constructor (input : InputController, camera : Camera) {
        this._input = input;
        this._camera = camera;
    }

    create (entity : Entity) {
        this._entity = entity;
        this._entity.attr.controller = this;
    }

    update (dt : number) {
        this._entity.pos.rotateDirection(this._camera.view.clone().reverse().offset(this._input.getPointerPos())); //TODO: optimize

        this._movement.reset();
        if (this._input.isDown(InputAction.LEFT)) this._movement.x -= 1;
        if (this._input.isDown(InputAction.RIGHT)) this._movement.x += 1;
        if (this._input.isDown(InputAction.UP)) this._movement.y -= 1;
        if (this._input.isDown(InputAction.DOWN)) this._movement.y += 1;

        this._entity.attr.movement.direct(this._movement, dt);

        //if (this._input.isDown(InputAction.ACTION_1)) {
        //    this._entity.weapon.attack();
        //}
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}