class Pointer implements IComponent<ComponentList> {
    active = true;
    private _input : InputState;
    private _pos : Vector;
    private _camera : Camera;
    private _material : Material;

    static reference(components : ComponentList) {
        return components.pointer;
    }

    constructor(pos : Vector, material : Material, input : InputState, camera : Camera) {
        this._pos = pos;
        this._material = material;
        this._input = input;
        this._camera = camera;
    }

    update(dt : number) : void {
        this._pos.copy(this._camera.target);
        this._pos.add(this._input.directionCoordinates);
        this._material.active = Math.abs(this._input.directionCoordinates.x) > 10 || Math.abs(this._input.directionCoordinates.y) > 10; //TODO: hmmm... could be better
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : ComponentList) {
        components.pointer = this;
    }
}