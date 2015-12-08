class MouseAndKeyboardAdaptor implements IInputController {
    private _mouseAndKeyboardController : MouseAndKeyboardController;
    private _lastPos = new Vector(0,0);
    private _camera : Camera;
    private _inputState : InputState;


    constructor(mouseAndKeyboardController : MouseAndKeyboardController, camera : Camera) {
        this._mouseAndKeyboardController = mouseAndKeyboardController;
        this._camera = camera;
    }

    load(inputState : InputState) {
        this._inputState = inputState;
        this._mouseAndKeyboardController.load(inputState);
    }

    loadKeyMappings(mappings : Object) {
        this._mouseAndKeyboardController.loadKeyMappings(mappings);
    }

    update(dt : number) {
        if (this._inputState.isKeyDown(InputAction.LEFT)) this._inputState.movementCoordinates.x -= 1;
        if (this._inputState.isKeyDown(InputAction.RIGHT)) this._inputState.movementCoordinates.x += 1;
        if (this._inputState.isKeyDown(InputAction.UP)) this._inputState.movementCoordinates.y -= 1;
        if (this._inputState.isKeyDown(InputAction.DOWN)) this._inputState.movementCoordinates.y += 1;

        if(!this._lastPos.equal(this._mouseAndKeyboardController.pointerPos)) {
            this._inputState.directionCoordinates.x = (this._mouseAndKeyboardController.pointerPos.x + this._camera.pos.x - this._camera.viewportOffset.x) - this._camera.target.x;
            this._inputState.directionCoordinates.y = (this._mouseAndKeyboardController.pointerPos.y + this._camera.pos.y - this._camera.viewportOffset.y) - this._camera.target.y;
            this._inputState.directionCoordinates.scale(1 / this._camera.zoom);

            this._lastPos.copy(this._mouseAndKeyboardController.pointerPos);
        }
    }
}