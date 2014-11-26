class InputControl implements IComponent<ComponentList> {
    active = true;

    _entity : Entity; //TODO: hmmm.... does this whole thing even need to be a Component?
    private _input : InputController;
    private _camera : Camera;
    private _movement = new Vector(0, 0);

    static reference(components : ComponentList) {
        return components.controller;
    }

    constructor (entity : Entity, input : InputController, camera : Camera) {
        this._entity = entity;
        this._input = input;
        this._camera = camera;
    }

    update (dt : number) {
        this._entity.pos.rotateDirection(this._camera.view.clone().offset(this._input.getPointerPos())); //TODO: optimize

        if(this._entity.hasActiveComponent(Movement)) {
            this._movement.reset();
            if (this._input.isDown(InputAction.LEFT)) this._movement.x -= 1;
            if (this._input.isDown(InputAction.RIGHT)) this._movement.x += 1;
            if (this._input.isDown(InputAction.UP)) this._movement.y -= 1;
            if (this._input.isDown(InputAction.DOWN)) this._movement.y += 1;

            this._entity.components.movement.direct(this._movement, dt);
        }

        if(this._input.isDown(InputAction.ACTION_1) && this._entity.hasActiveComponent(WeaponHolder)) {
            this._entity.components.weaponHolder.attack();
        }
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

    build(components : ComponentList) {
        components.controller = this;
    }
}