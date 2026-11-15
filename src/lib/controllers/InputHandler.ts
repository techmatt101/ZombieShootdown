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
        const controllers = this.#controllers;
        for (let i = 0; i < controllers.length; i++) {
            controllers[i].load(this.#inputState);
        }
    }

    update(dt : number) {
        this.#inputState.movementCoordinates.reset();
        this.#inputState.directionCoordinates.reset();

        const controllers = this.#controllers;
        for (let i = 0; i < controllers.length; i++) {
            controllers[i].update(dt);
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }
}
