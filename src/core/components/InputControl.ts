class InputControl implements IComponent {
    private _entity : Entity;
    private _input : InputController;
    private _camera : Camera;
    private _movement = new Vector();


    constructor (entity : Entity, input : InputController, camera : Camera) {
        this._entity = entity;
        this._input = input;
        this._camera = camera;
    }

    update (dt : number) {
        this._entity.pos.rotateDirection(this._camera.view.clone().reverse().offset(this._input.getPointerPos())); //TODO: optimize

        if(this._entity.components.has(Movement)) {
            var movement = <Movement> this._entity.components.get(Movement);

            this._movement.reset();
            if (this._input.isDown(InputAction.LEFT)) this._movement.x -= 1;
            if (this._input.isDown(InputAction.RIGHT)) this._movement.x += 1;
            if (this._input.isDown(InputAction.UP)) this._movement.y -= 1;
            if (this._input.isDown(InputAction.DOWN)) this._movement.y += 1;

            movement.direct(this._movement, dt);
        }

        //if (this._input.isDown(InputAction.ACTION_1)) {
        //    this._entity.weapon.attack();
        //}
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}