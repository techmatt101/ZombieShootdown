class InputControl implements IComponent<ComponentList> {
    active = true;

    private _entity : Entity;
    private _input : InputState;

    static reference(components : ComponentList) {
        return components.controller;
    }

    constructor(entity : Entity, input : InputState) {
        this._entity = entity;
        this._input = input;
    }

    update(dt : number) {
        this._entity.components.movement.direct(this._input.movementAxes, dt);
        this._entity.pos.angle = fastAtan2(this._input.directionAxes.x, this._input.directionAxes.y);

        if (this._input.isKeyDown(InputAction.ACTION_1) && this._entity.hasActiveComponent(WeaponHolder)) {
            this._entity.components.weaponHolder.attack();
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : ComponentList) {
        components.controller = this;
    }
}