class InputHandler {
    private _controllers : IInputController[] = [];
    private _inputState : InputState;


    constructor(inputActions : Object) {
        this._inputState = new InputState(inputActions);

        // rest buttons on lose focus of window
        window.addEventListener('blur', () => {
            this._inputState.reset();
        });
    }

    getState() {
        return this._inputState;
    }

    loadController(controller : IInputController) {
        this._controllers.push(controller);
    }

    load() {
        for (var i = 0; i < this._controllers.length; i++) {
            this._controllers[i].load(this._inputState);
        }
    }

    update(dt : number) {
        this._inputState.movementAxes.reset();
        for (var i = 0; i < this._controllers.length; i++) {
            this._controllers[i].update(dt);
        }
    }
}