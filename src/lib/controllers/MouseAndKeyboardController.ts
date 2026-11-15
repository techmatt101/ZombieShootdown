import type { InputState } from './InputState';
import { resolveKeyMappings, type KeyBindings, type KeyMappings } from './KeyMapper';
import { Vector } from '../geometry/Vector';

const mouseButtonCode = (e : MouseEvent) => `Mouse${e.button}`;

export class MouseAndKeyboardController {
    pointerPos = new Vector(0, 0);

    #keys : KeyBindings = new Map();
    #inputState! : InputState;
    #canvas : HTMLCanvasElement;
    #pointerLockEnabled = false;


    constructor(canvas : HTMLCanvasElement) {
        this.#canvas = canvas;
    }

    load(inputState : InputState) {
        this.#inputState = inputState;
        this.#listenForButtons();
        this.#disableContextMenu();
        this.#trackPointer();
        this.#enablePointerLock();
    }

    loadKeyMappings(mappings : KeyMappings) {
        this.#keys = resolveKeyMappings(mappings);
    }

    #listenForButtons() {
        window.addEventListener('keyup', (e) => {
            this.#inputState.setKeyRelease(this.#keys.get(e.code));
        });

        window.addEventListener('keydown', (e) => {
            this.#inputState.setKeyPress(this.#keys.get(e.code));
        });

        window.addEventListener('mousedown', (e) => {
            this.#inputState.setKeyPress(this.#keys.get(mouseButtonCode(e)));
        });

        window.addEventListener('mouseup', (e) => {
            this.#inputState.setKeyRelease(this.#keys.get(mouseButtonCode(e)));
        });
    }

    #disableContextMenu() {
        this.#canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    #trackPointer() {
        this.#canvas.addEventListener('mousemove', (e) => {
            if (this.#pointerLockEnabled) {
                this.pointerPos.x += e.movementX;
                this.pointerPos.y += e.movementY;
            } else {
                this.pointerPos.x = e.offsetX;
                this.pointerPos.y = e.offsetY;
            }
        });
    }

    #enablePointerLock() {
        document.addEventListener('pointerlockchange', () => this.#onPointerLockChange());
        this.#onPointerLockChange();
    }

    #onPointerLockChange() {
        this.#pointerLockEnabled = document.pointerLockElement === this.#canvas;
        if (!this.#pointerLockEnabled) {
            this.#requestPointerLockOnNextClick();
        }
    }

    #requestPointerLockOnNextClick() {
        window.addEventListener('click', async () => {
            try {
                await this.#canvas.requestPointerLock();
            } catch (error) {
                console.warn('Pointer lock unavailable, retrying on next click', error);
                this.#requestPointerLockOnNextClick();
            }
        }, { once: true });
    }
}
