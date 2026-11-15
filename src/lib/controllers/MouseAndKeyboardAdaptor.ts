import type { Camera } from '../Camera';
import type { IInputController } from './IInputController';
import { InputAction } from './InputAction';
import type { InputState } from './InputState';
import type { KeyMappings } from './KeyMapper';
import type { MouseAndKeyboardController } from './MouseAndKeyboardController';
import { Vector } from '../geometry/Vector';

export class MouseAndKeyboardAdaptor implements IInputController {
    #mouseAndKeyboardController : MouseAndKeyboardController;
    #lastPos = new Vector(0, 0);
    #aimPoint = new Vector(0, 0);
    #camera : Camera;
    #inputState! : InputState;


    constructor(mouseAndKeyboardController : MouseAndKeyboardController, camera : Camera) {
        this.#mouseAndKeyboardController = mouseAndKeyboardController;
        this.#camera = camera;
    }

    load(inputState : InputState) {
        this.#inputState = inputState;
        this.#mouseAndKeyboardController.load(inputState);
    }

    loadKeyMappings(mappings : KeyMappings) {
        this.#mouseAndKeyboardController.loadKeyMappings(mappings);
    }

    update(dt : number) {
        if (this.#inputState.isKeyDown(InputAction.LEFT)) this.#inputState.movementCoordinates.x -= 1;
        if (this.#inputState.isKeyDown(InputAction.RIGHT)) this.#inputState.movementCoordinates.x += 1;
        if (this.#inputState.isKeyDown(InputAction.UP)) this.#inputState.movementCoordinates.y -= 1;
        if (this.#inputState.isKeyDown(InputAction.DOWN)) this.#inputState.movementCoordinates.y += 1;

        const mouseMoved = !this.#lastPos.equal(this.#mouseAndKeyboardController.pointerPos);
        if (mouseMoved) {
            this.#inputState.aimSource = 'mouse';
        }
        if (this.#inputState.aimSource === 'mouse') {
            this.#aimAtPointer();
        }
    }

    #aimAtPointer() {
        const camera = this.#camera;
        const pointer = this.#mouseAndKeyboardController.pointerPos;
        const aimPoint = camera.screenToWorld(pointer, this.#aimPoint);
        const clampedX = Math.min(Math.max(aimPoint.x, camera.view.left), camera.view.right);
        const clampedY = Math.min(Math.max(aimPoint.y, camera.view.top), camera.view.bottom);
        pointer.x += (clampedX - aimPoint.x) * camera.zoom;
        pointer.y += (clampedY - aimPoint.y) * camera.zoom;

        const target = camera.target ?? camera.pos;
        this.#inputState.directionCoordinates.set(clampedX - target.x, clampedY - target.y);
        this.#lastPos.copy(pointer);
    }
}
