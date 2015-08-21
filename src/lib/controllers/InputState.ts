class InputState {
    movementAxes = new Vector(0, 0);
    directionAxes = new Vector(0, 0);
    inputActions : Object;

    private _pressed : {[action : number] : boolean} = {};


    constructor(inputActions : Object) {
        this.inputActions = inputActions;

        // load all possible actions to prevent undefined on lookups
        for (var action in inputActions) {
            if (!isNaN(parseInt(action))) { // accept number enums only
                this._pressed[action] = false;
            }
        }
        this._pressed['undefined'] = false; // silence undefined key events
    }

    isKeyDown(actionKey) {
        return this._pressed[actionKey] === true;
    }

    setKeyPress(actionKey) {
        this._pressed[actionKey] = true;
    }

    setKeyRelease(actionKey) {
        this._pressed[actionKey] = false;
    }

    reset() {
        for (var key in this._pressed) {
            this._pressed[key] = false;
        }
    }
}