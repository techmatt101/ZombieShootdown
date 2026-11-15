import type { IInputController } from './IInputController';
import { InputState } from './InputState';
import { KeyMapper, type KeyBindings, type KeyMappings } from './KeyMapper';
import { Vector } from '../geometry/Vector';

export enum GamepadAxe {
    LEFT_ANALOGUE_HORIZONTAL = 0,
    LEFT_ANALOGUE_VERTICAL = 1,
    RIGHT_ANALOGUE_HORIZONTAL = 2,
    RIGHT_ANALOGUE_VERTICAL = 3
}

export class GamepadController implements IInputController {
    #keys : KeyBindings = {};
    #inputState! : InputState; // set in load()
    #lastButtonState : boolean[] = [];
    #gamepad : Gamepad | null = null;
    #axisThreshold = 0.3;
    public leftAxes = new Vector(0 ,0);
    public rightAxes = new Vector(0 ,0);


    load(inputState : InputState) {
        this.#inputState = inputState;
    }

    loadKeyMappings(mappings : KeyMappings | undefined) {
        KeyMapper.loadKeyMappings(this.#keys, mappings, this.#inputState.inputActions);
    }

    update(dt : number) {
        this.#gamepad = navigator.getGamepads()[0];
        if (!this.#gamepad) {
            return;
        }

        // Sticks
        var leftAxes = new Vector(this.#gamepad.axes[GamepadAxe.LEFT_ANALOGUE_HORIZONTAL], this.#gamepad.axes[GamepadAxe.LEFT_ANALOGUE_VERTICAL]);
        var rightAxes = new Vector(this.#gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_HORIZONTAL], this.#gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_VERTICAL]);

        if(leftAxes.len() > this.#axisThreshold) {
            this.leftAxes.copy(leftAxes);
        } else {
            this.leftAxes.reset();
        }

        if(rightAxes.len() > this.#axisThreshold) {
            this.rightAxes.copy(rightAxes);
        } else {
            this.rightAxes.reset();
        }

        // Buttons
        if (this.#lastButtonState.length === 0) {
            for (var i = 0; i < this.#gamepad.buttons.length; i++) {
                this.#lastButtonState.push(this.#gamepad.buttons[i].pressed);
            }
        }

        for (var i = 0; i < this.#gamepad.buttons.length; i++) {
            if (this.#gamepad.buttons[i].pressed !== this.#lastButtonState[i]) {
                if (this.#gamepad.buttons[i].pressed) {
                    this.#inputState.setKeyPress(this.#keys[i]);
                } else {
                    this.#inputState.setKeyRelease(this.#keys[i]);
                }
            }
            this.#lastButtonState[i] = this.#gamepad.buttons[i].pressed;
        }
    }
}
