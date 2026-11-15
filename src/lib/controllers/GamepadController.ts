import type { IInputController } from './IInputController';
import { InputState } from './InputState';
import { resolveKeyMappings, type KeyBindings, type KeyMappings } from './KeyMapper';
import { Vector } from '../geometry/Vector';

export enum GamepadAxe {
    LEFT_ANALOGUE_HORIZONTAL = 0,
    LEFT_ANALOGUE_VERTICAL = 1,
    RIGHT_ANALOGUE_HORIZONTAL = 2,
    RIGHT_ANALOGUE_VERTICAL = 3
}

export class GamepadController implements IInputController {
    #keys : KeyBindings = new Map();
    #inputState! : InputState;
    #lastButtonState : boolean[] = [];
    #axisThreshold = 0.3;
    public leftAxes = new Vector(0 ,0);
    public rightAxes = new Vector(0 ,0);


    load(inputState : InputState) {
        this.#inputState = inputState;
    }

    loadKeyMappings(mappings : KeyMappings) {
        this.#keys = resolveKeyMappings(mappings);
    }

    update(dt : number) {
        const gamepad = navigator.getGamepads()[0];
        if (!gamepad) {
            return;
        }

        this.#updateSticks(gamepad);
        this.#updateButtons(gamepad);
    }

    #updateSticks(gamepad : Gamepad) {
        const leftAxes = new Vector(gamepad.axes[GamepadAxe.LEFT_ANALOGUE_HORIZONTAL], gamepad.axes[GamepadAxe.LEFT_ANALOGUE_VERTICAL]);
        const rightAxes = new Vector(gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_HORIZONTAL], gamepad.axes[GamepadAxe.RIGHT_ANALOGUE_VERTICAL]);

        if (leftAxes.len() > this.#axisThreshold) {
            this.leftAxes.copy(leftAxes);
        } else {
            this.leftAxes.reset();
        }

        if (rightAxes.len() > this.#axisThreshold) {
            this.rightAxes.copy(rightAxes);
        } else {
            this.rightAxes.reset();
        }
    }

    #updateButtons(gamepad : Gamepad) {
        const buttons = gamepad.buttons;
        const lastButtonState = this.#lastButtonState;
        const isFirstPoll = lastButtonState.length === 0;
        for (let i = 0; i < buttons.length; i++) {
            const pressed = buttons[i].pressed;
            const changed = !isFirstPoll && pressed !== lastButtonState[i];
            lastButtonState[i] = pressed;
            if (changed) {
                const action = this.#keys.get(`Button${i}`);
                if (pressed) {
                    this.#inputState.setKeyPress(action);
                } else {
                    this.#inputState.setKeyRelease(action);
                }
            }
        }
    }
}
