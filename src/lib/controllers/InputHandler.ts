import type { IInputController } from './IInputController';
import { InputState } from './InputState';
import type { IUpdate } from '../IUpdate';

export class InputHandler implements IUpdate {
    #controllers : IInputController[] = [];
    #inputState = new InputState();


    constructor() {
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
        for (const controller of this.#controllers) {
            controller.load(this.#inputState);
        }
    }

    update(dt : number) {
        this.#inputState.movementCoordinates.reset();
        this.#inputState.directionCoordinates.reset();

        for (const controller of this.#controllers) {
            controller.update(dt);
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }
}
