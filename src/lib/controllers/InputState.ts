import type { InputAction } from './InputAction';
import { Vector } from '../geometry/Vector';

export class InputState {
    movementCoordinates = new Vector(0, 0);
    directionCoordinates = new Vector(0, 0);
    /** The device that most recently aimed; it keeps ownership of `directionCoordinates` until another takes over. */
    aimSource : 'mouse' | 'gamepad' | null = null;

    #pressed = new Set<InputAction>();

    isKeyDown(action : InputAction) {
        return this.#pressed.has(action);
    }

    /** Unmapped inputs arrive as `undefined` and are ignored. */
    setKeyPress(action : InputAction | undefined) {
        if (action !== undefined) {
            this.#pressed.add(action);
        }
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
