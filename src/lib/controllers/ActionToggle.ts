import type { InputAction } from './InputAction';
import type { InputState } from './InputState';

export class ActionToggle {
    isOn : boolean;
    #input : InputState;
    #action : InputAction;
    #handledPresses : number;

    constructor(input : InputState, action : InputAction, isOn : boolean) {
        this.#input = input;
        this.#action = action;
        this.isOn = isOn;
        this.#handledPresses = input.pressCount(action);
    }

    update() {
        const presses = this.#input.pressCount(this.#action);
        const isOddNumberOfNewPresses = (presses - this.#handledPresses) % 2 === 1;
        if (isOddNumberOfNewPresses) {
            this.isOn = !this.isOn;
        }
        this.#handledPresses = presses;
    }
}
