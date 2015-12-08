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
            var pointOnCanvas = new Vector(
                this._mouseAndKeyboardController.pointerPos.x + this._camera.pos.x - this._camera.viewportOffset.x,
                this._mouseAndKeyboardController.pointerPos.y + this._camera.pos.y - this._camera.viewportOffset.y
            );

            if (pointOnCanvas.x > this._camera.viewport.width) {
                this._mouseAndKeyboardController.pointerPos.x -= pointOnCanvas.x - this._camera.viewport.width;
                pointOnCanvas.x = this._camera.viewport.width;
            } else if (pointOnCanvas.x < this._camera.viewport.pos.x) {
                this._mouseAndKeyboardController.pointerPos.x += this._camera.viewport.pos.x - pointOnCanvas.x;
                pointOnCanvas.x = this._camera.viewport.pos.x;
            }

            if (pointOnCanvas.y > this._camera.viewport.height) {
                this._mouseAndKeyboardController.pointerPos.y -= pointOnCanvas.y - this._camera.viewport.height;
                pointOnCanvas.y = this._camera.viewport.height;
            } else if (pointOnCanvas.y < this._camera.viewport.pos.y) {
                this._mouseAndKeyboardController.pointerPos.y += this._camera.viewport.pos.y - pointOnCanvas.y;
                pointOnCanvas.y = this._camera.viewport.pos.y;
            }

            this._inputState.directionCoordinates.x = pointOnCanvas.x - this._camera.target.x;
            this._inputState.directionCoordinates.y = pointOnCanvas.y - this._camera.target.y;

            this._inputState.directionCoordinates.scale(1 / this._camera.zoom);

            this._lastPos.copy(this._mouseAndKeyboardController.pointerPos);
        }
    }
}