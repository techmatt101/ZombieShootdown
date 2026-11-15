import type { InputAction } from './InputAction';
import { Vector } from '../geometry/Vector';

export class InputState {
    movementCoordinates = new Vector(0, 0);
    directionCoordinates = new Vector(0, 0);
    aimSource : 'mouse' | 'gamepad' | null = null;

    #pressed = new Set<InputAction>();
    #pressCounts = new Map<InputAction, number>();

    isKeyDown(action : InputAction) {
        return this.#pressed.has(action);
    }

    pressCount(action : InputAction) {
        return this.#pressCounts.get(action) ?? 0;
    }

    setKeyPress(action : InputAction | undefined) {
        if (action === undefined || this.#pressed.has(action)) return;
        this.#pressed.add(action);
        this.#pressCounts.set(action, this.pressCount(action) + 1);
    }

    setKeyRelease(action : InputAction | undefined) {
        if (action !== undefined) {
            this.#pressed.delete(action);
        }
    }

    reset() {
        this.#pressed.clear();
    }
}
