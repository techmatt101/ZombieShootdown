enum GamepadAxe {
    LEFT_ANALOGUE_HORIZONTAL = 0,
    LEFT_ANALOGUE_VERTICAL = 1,
    RIGHT_ANALOGUE_HORIZONTAL = 2,
    RIGHT_ANALOGUE_VERTICAL = 3
}

class GamepadController implements IInputController {
    private _keys = {};
    private _inputState : InputState;
    private _lastButtonState : boolean[] = [];
    private _gamepad : Gamepad;
    private _axisThreshold = 0.3;
    public leftAxes = new Vector(0 ,0);
    public rightAxes = new Vector(0 ,0);


    load(inputState : InputState) {
        this._inputState = inputState;
    }

    loadKeyMappings(mappings : Object) {
        KeyMapper.loadKeyMappings(this._keys, mappings, this._inputState.inputActions);
    }

    update(dt : number) {
        this._gamepad = navigator.getGamepads()[0];
        if (typeof this._gamepad === 'undefined') {
            return;
        }

        // Sticks
        var leftAxes = new Vector(this._gamepad.axes[GamepadAxe.LEFT_ANALOGUE_HORIZONTAL], this._gamepad.axes[GamepadAxe.LEFT_ANALOGUE_VERTICAL]);
        var rightAxes = new Vector(this._gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_HORIZONTAL], this._gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_VERTICAL]);

        if(leftAxes.len() > this._axisThreshold) {
            this.leftAxes.copy(leftAxes);
        } else {
            this.leftAxes.reset();
        }

        if(rightAxes.len() > this._axisThreshold) {
            this.rightAxes.copy(rightAxes);
        } else {
            this.rightAxes.reset();
        }

        // Buttons
        if (typeof this._lastButtonState === "undefined") {
            for (var i = 0; i < this._gamepad.buttons.length; i++) {
                this._lastButtonState.push(this._gamepad.buttons[i].pressed);
            }
        }

        for (var i = 0; i < this._gamepad.buttons.length; i++) {
            if (this._gamepad.buttons[i].pressed !== this._lastButtonState[i]) {
                if (this._gamepad.buttons[i].pressed) {
                    this._inputState.setKeyPress(this._keys[i]);
                } else {
                    this._inputState.setKeyRelease(this._keys[i]);
                }
            }
            this._lastButtonState[i] = this._gamepad.buttons[i].pressed;
        }
    }
}