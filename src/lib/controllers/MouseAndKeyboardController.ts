import type { InputState } from './InputState';
import { resolveKeyMappings, type KeyBindings, type KeyMappings } from './KeyMapper';
import { Vector } from '../geometry/Vector';

const mouseButtonCode = (e : MouseEvent) => `Mouse${e.button}`;

export class MouseAndKeyboardController {
    pointerPos = new Vector(0, 0);

    #keys : KeyBindings = new Map();
    #inputState! : InputState;
    #canvas : HTMLCanvasElement;
    #signal : AbortSignal | undefined;
    #pointerLockEnabled = false;


    constructor(canvas : HTMLCanvasElement, signal? : AbortSignal) {
        this.#canvas = canvas;
        this.#signal = signal;
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
        }, { signal: this.#signal });

        window.addEventListener('keydown', (e) => {
            this.#inputState.setKeyPress(this.#keys.get(e.code));
        }, { signal: this.#signal });

        window.addEventListener('mousedown', (e) => {
            this.#inputState.setKeyPress(this.#keys.get(mouseButtonCode(e)));
        }, { signal: this.#signal });

        window.addEventListener('mouseup', (e) => {
            this.#inputState.setKeyRelease(this.#keys.get(mouseButtonCode(e)));
        }, { signal: this.#signal });
    }

    #disableContextMenu() {
        this.#canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        }, { signal: this.#signal });
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
        }, { signal: this.#signal });
    }

    #enablePointerLock() {
        document.addEventListener('pointerlockchange', () => this.#onPointerLockChange(), { signal: this.#signal });
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
        }, { once: true, signal: this.#signal });
    }
}
