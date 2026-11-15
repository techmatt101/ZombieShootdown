import { Camera } from '../Camera';
import type { IInputController } from './IInputController';
import { InputAction } from './InputAction';
import { InputState } from './InputState';
import type { KeyMappings } from './KeyMapper';
import { MouseAndKeyboardController } from './MouseAndKeyboardController';
import { Vector } from '../geometry/Vector';

export class MouseAndKeyboardAdaptor implements IInputController {
    #mouseAndKeyboardController : MouseAndKeyboardController;
    #lastPos = new Vector(0,0);
    #camera : Camera;
    #inputState! : InputState; // set in load()


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

        // Moving the mouse takes over aiming; while it owns aim, recompute every frame so the
        // crosshair stays visible and keeps tracking as the player/camera move under a still mouse.
        if (!this.#lastPos.equal(this.#mouseAndKeyboardController.pointerPos)) {
            this.#inputState.aimSource = 'mouse';
        }

        if (this.#inputState.aimSource === 'mouse') {
            const pointOnCanvas = new Vector(
                this.#mouseAndKeyboardController.pointerPos.x + this.#camera.pos.x - this.#camera.viewportOffset.x,
                this.#mouseAndKeyboardController.pointerPos.y + this.#camera.pos.y - this.#camera.viewportOffset.y
            );

            if (pointOnCanvas.x > this.#camera.viewport.width) {
                this.#mouseAndKeyboardController.pointerPos.x -= pointOnCanvas.x - this.#camera.viewport.width;
                pointOnCanvas.x = this.#camera.viewport.width;
            } else if (pointOnCanvas.x < this.#camera.viewport.pos.x) {
                this.#mouseAndKeyboardController.pointerPos.x += this.#camera.viewport.pos.x - pointOnCanvas.x;
                pointOnCanvas.x = this.#camera.viewport.pos.x;
            }

            if (pointOnCanvas.y > this.#camera.viewport.height) {
                this.#mouseAndKeyboardController.pointerPos.y -= pointOnCanvas.y - this.#camera.viewport.height;
                pointOnCanvas.y = this.#camera.viewport.height;
            } else if (pointOnCanvas.y < this.#camera.viewport.pos.y) {
                this.#mouseAndKeyboardController.pointerPos.y += this.#camera.viewport.pos.y - pointOnCanvas.y;
                pointOnCanvas.y = this.#camera.viewport.pos.y;
            }

            const target = this.#camera.target ?? this.#camera.pos;
            this.#inputState.directionCoordinates.x = pointOnCanvas.x - target.x;
            this.#inputState.directionCoordinates.y = pointOnCanvas.y - target.y;

            this.#inputState.directionCoordinates.scale(1 / this.#camera.zoom);

            this.#lastPos.copy(this.#mouseAndKeyboardController.pointerPos);
        }
    }
}
