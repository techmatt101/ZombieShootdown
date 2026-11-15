import { Camera } from '../Camera';
import { GamepadController } from './GamepadController';
import type { IInputController } from './IInputController';
import { InputState } from './InputState';
import type { KeyMappings } from './KeyMapper';

export class GamepadAdaptor implements IInputController {
    #gamepadController : GamepadController;
    #camera : Camera;
    #inputState! : InputState;


    constructor(gamepadController : GamepadController, camera : Camera) {
        this.#gamepadController = gamepadController;
        this.#camera = camera;
    }

    load(inputState : InputState) {
        this.#inputState = inputState;
        this.#gamepadController.load(inputState);
    }

    loadKeyMappings(mappings : KeyMappings) {
        this.#gamepadController.loadKeyMappings(mappings);
    }

    update(dt : number) {
        this.#gamepadController.update(dt);
        this.#inputState.movementCoordinates.copy(this.#gamepadController.leftAxes);
        const isRightStickAiming = this.#gamepadController.rightAxes.len() > 0;
        if (isRightStickAiming) {
            this.#inputState.aimSource = 'gamepad';
            this.#inputState.directionCoordinates.copy(this.#gamepadController.rightAxes).scale(Math.min(this.#camera.size.x, this.#camera.size.y) / 2);
        }
    }
}
