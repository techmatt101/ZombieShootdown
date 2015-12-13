class InputControl implements IComponent {
    active = true;

    private _entity : Entity;
    private _input : InputState;

    static reference(components : IComponentDirectory) {
        return components.controller;
    }

    constructor(entity : Entity, input : InputState) {
        this._entity = entity;
        this._input = input;
    }

    update(dt : number) {
        this._entity.components.movement.direction.copy(this._input.movementCoordinates);
        if(this._input.directionCoordinates.x !== 0 || this._input.directionCoordinates.y !== 0) {
            this._entity.pos.direction = fastAtan2(this._input.directionCoordinates.x, this._input.directionCoordinates.y);
        }

        if (this._input.isKeyDown(InputAction.ACTION_1) && this._entity.hasActiveComponent(WeaponHolder)) {
            this._entity.components.weaponHolder.attack();
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.controller = this;
    }
}