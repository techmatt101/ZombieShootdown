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
    private _axisThreshold = 0.25 * 2;


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

        if (typeof this._lastButtonState === "undefined") {
            for (var i = 0; i < this._gamepad.buttons.length; i++) {
                this._lastButtonState.push(this._gamepad.buttons[i].pressed);
            }
        }

        var totalLeftAxes = Math.abs(this._gamepad.axes[GamepadAxe.LEFT_ANALOGUE_HORIZONTAL]) + Math.abs(this._gamepad.axes[GamepadAxe.LEFT_ANALOGUE_VERTICAL]);
        var totalRightAxes = Math.abs(this._gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_HORIZONTAL]) + Math.abs(this._gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_VERTICAL]);

        if(totalLeftAxes > this._axisThreshold) {
            this._inputState.movementAxes.x = this._gamepad.axes[GamepadAxe.LEFT_ANALOGUE_HORIZONTAL];
            this._inputState.movementAxes.y = this._gamepad.axes[GamepadAxe.LEFT_ANALOGUE_VERTICAL];
        }

        if(totalRightAxes > this._axisThreshold) {
            this._inputState.directionAxes.x = this._gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_HORIZONTAL];
            this._inputState.directionAxes.y = this._gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_VERTICAL];
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