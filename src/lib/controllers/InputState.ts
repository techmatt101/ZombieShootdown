import type { InputAction } from './InputAction';
import type { InputActions } from './KeyMapper';
import { Vector } from '../geometry/Vector';

export class InputState {
    movementCoordinates = new Vector(0, 0);
    directionCoordinates = new Vector(0, 0);
    inputActions : InputActions;

    // Keyed by stringified action; unmapped keys arrive as `undefined` and land on the 'undefined' slot.
    #pressed : Record<string, boolean> = {};


    constructor(inputActions : InputActions) {
        this.inputActions = inputActions;

        // load all possible actions to prevent undefined on lookups
        for (const action in inputActions) {
            if (!isNaN(parseInt(action))) { // accept number enums only
                this.#pressed[action] = false;
            }
        }
        this.#pressed['undefined'] = false; // silence undefined key events
    }

    isKeyDown(actionKey : InputAction) {
        return this.#pressed[actionKey] === true;
    }

    setKeyPress(actionKey : InputAction | undefined) {
        this.#pressed[String(actionKey)] = true;
    }

    setKeyRelease(actionKey : InputAction | undefined) {
        this.#pressed[String(actionKey)] = false;
    }

    reset() {
        for (const key in this.#pressed) {
            this.#pressed[key] = false;
        }
    }
}
