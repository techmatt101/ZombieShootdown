import type { IInputController } from './IInputController';
import { InputState } from './InputState';
import type { InputActions } from './KeyMapper';
import type { IUpdate } from '../IUpdate';

export class InputHandler implements IUpdate {
    #controllers : IInputController[] = [];
    #inputState : InputState;


    constructor(inputActions : InputActions) {
        this.#inputState = new InputState(inputActions);

        // rest buttons on lose focus of window
        window.addEventListener('blur', () => {
            this.#inputState.reset();
        });
    }

    getState() {
        return this.#inputState;
    }

    loadController(controller : IInputController) {
        this.#controllers.push(controller);
    }

    load() {
        for (var i = 0; i < this.#controllers.length; i++) {
            this.#controllers[i].load(this.#inputState);
        }
    }

    update(dt : number) {
        this.#inputState.movementCoordinates.reset();
        this.#inputState.directionCoordinates.reset();

        for (var i = 0; i < this.#controllers.length; i++) {
            this.#controllers[i].update(dt);
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }
}
